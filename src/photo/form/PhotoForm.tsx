'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FORM_METADATA_ENTRIES,
  PhotoFormData,
  convertFormKeysToLabels,
  getFormErrors,
  isFormValid,
} from '.';
import FieldSetWithStatus from '@/components/FieldSetWithStatus';
import {
  createPhotoAction,
  streamImageQueryAction,
  updatePhotoAction,
} from '../actions';
import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';
import Link from 'next/link';
import { clsx } from 'clsx/lite';
import CanvasBlurCapture from '@/components/CanvasBlurCapture';
import { PATH_ADMIN_PHOTOS, PATH_ADMIN_UPLOADS } from '@/site/paths';
import {
  generateLocalNaivePostgresString,
  generateLocalPostgresString,
} from '@/utility/date';
import { toastSuccess, toastWarning } from '@/toast';
import { getDimensionsFromSize } from '@/utility/size';
import ImageBlurFallback from '@/components/ImageBlurFallback';
import { BLUR_ENABLED } from '@/site/config';
import { Tags, sortTagsObjectWithoutFavs } from '@/tag';
import { formatCount, formatCountDescriptive } from '@/utility/string';
import { readStreamableValue } from 'ai/rsc';
import Spinner from '@/components/Spinner';
import useImageQuery from '../ai/useImageQuery';

const THUMBNAIL_SIZE = 300;

export default function PhotoForm({
  initialPhotoForm,
  updatedExifData,
  type = 'create',
  uniqueTags,
  debugBlur,
  onTitleChange,
  onFormStatusChange,
}: {
  initialPhotoForm: Partial<PhotoFormData>
  updatedExifData?: Partial<PhotoFormData>
  type?: 'create' | 'edit'
  uniqueTags?: Tags
  debugBlur?: boolean
  onTitleChange?: (updatedTitle: string) => void
  onFormStatusChange?: (pending: boolean) => void
}) {
  const [formData, setFormData] =
    useState<Partial<PhotoFormData>>(initialPhotoForm);
  const [formErrors, setFormErrors] =
    useState(getFormErrors(initialPhotoForm));
  const [imageData, setImageData] =
    useState<string>();

  // Update form when EXIF data
  // is refreshed by parent
  useEffect(() => {
    if (Object.keys(updatedExifData ?? {}).length > 0) {
      const changedKeys: (keyof PhotoFormData)[] = [];

      setFormData(currentForm => {
        Object.entries(updatedExifData ?? {})
          .forEach(([key, value]) => {
            if (currentForm[key as keyof PhotoFormData] !== value) {
              changedKeys.push(key as keyof PhotoFormData);
            }
          });

        return {
          ...currentForm,
          ...updatedExifData,
        };
      });

      if (changedKeys.length > 0) {
        const fields = convertFormKeysToLabels(changedKeys);
        toastSuccess(
          `Updated EXIF fields: ${fields.join(', ')}`,
          8000,
        );
      } else {
        toastWarning('No new EXIF data found');
      }
    }
  }, [updatedExifData]);

  const {
    width,
    height,
  } = getDimensionsFromSize(THUMBNAIL_SIZE, formData.aspectRatio);

  // Generate local date strings when
  // none can be extracted from EXIF
  useEffect(() => {
    if (!formData.takenAt || !formData.takenAtNaive) {
      setFormData(data => ({
        ...data,
        ...!formData.takenAt && {
          takenAt: generateLocalPostgresString(),
        },
        ...!formData.takenAtNaive && {
          takenAtNaive: generateLocalNaivePostgresString(),
        },
      }));
    }
  }, [formData.takenAt, formData.takenAtNaive]);

  const url = formData.url ?? '';

  const updateBlurData = useCallback((blurData: string) => {
    if (BLUR_ENABLED) {
      setFormData(data => ({
        ...data,
        blurData,
      }));
    }
  }, []);

  const [
    requestTitle,
    title,
    isLoadingTitle,
  ] = useImageQuery(imageData, 'title');

  const [aiTags, setAiTags] = useState({
    two: '',
    three: '',
  });
  const [isLoadingAi, setIsLoadingAi] = useState({
    two: false,
    three: false,
  });

  return (
    <div className="space-y-8 max-w-[38rem]">
      <div className="flex gap-2">
        <button onClick={requestTitle}>
          Title ✨
        </button>
        <button onClick={async () => {
          setIsLoadingAi(current => ({
            ...current,
            two: true,
          }));
          const textStream = await streamImageQueryAction(
            imageData ?? '',
            'tags',
          );
          for await (const text of readStreamableValue(textStream)) {
            setAiTags(current => ({
              ...current,
              two: text ?? '',
            }));
          }
          setIsLoadingAi(current => ({
            ...current,
            two: false,
          }));
        }}>
          Tags ✨
        </button>
        <button onClick={async () => {
          setIsLoadingAi(current => ({
            ...current,
            three: true,
          }));
          const textStream = await streamImageQueryAction(
            imageData ?? '',
            'description',
          );
          for await (const text of readStreamableValue(textStream)) {
            setAiTags(current => ({
              ...current,
              three: text ?? '',
            }));
          }
          setIsLoadingAi(current => ({
            ...current,
            three: false,
          }));
        }}>
          Description ✨
        </button>
      </div>
      <div className="flex gap-2">
        <ImageBlurFallback
          alt="Upload"
          src={url}
          className={clsx(
            'border rounded-md overflow-hidden',
            'border-gray-200 dark:border-gray-700'
          )}
          width={width}
          height={height}
          priority
        />
        <CanvasBlurCapture
          imageUrl={url}
          width={width}
          height={height}
          onLoad={setImageData}
          onCapture={updateBlurData}
        />
        {debugBlur && formData.blurData &&
          <img
            alt="blur"
            src={formData.blurData}
            className={clsx(
              'border rounded-md overflow-hidden',
              'border-gray-200 dark:border-gray-700'
            )}
            width={width}
            height={height}
          />}
      </div>
      <p>
        AI RESPONSE 01: {title} {isLoadingTitle && <>
          <span className="inline-flex translate-y-[1.5px]">
            <Spinner />
          </span>
        </>}
      </p>
      <p>
        AI RESPONSE 02: {aiTags.two} {isLoadingAi.two && <>
          <span className="inline-flex translate-y-[1.5px]">
            <Spinner />
          </span>
        </>}
      </p>
      <p>
        AI RESPONSE 01: {aiTags.three} {isLoadingAi.three && <>
          <span className="inline-flex translate-y-[1.5px]">
            <Spinner />
          </span>
        </>}
      </p>
      <form
        action={type === 'create' ? createPhotoAction : updatePhotoAction}
        onSubmit={() => blur()}
        className="space-y-6"
      >
        {FORM_METADATA_ENTRIES(
          sortTagsObjectWithoutFavs(uniqueTags ?? [])
            .map(({ tag, count }) => ({
              value: tag,
              annotation: formatCount(count),
              annotationAria: formatCountDescriptive(count, 'tagged'),
            }))
        )
          .map(([key, {
            label,
            note,
            required,
            selectOptions,
            selectOptionsDefaultLabel,
            tagOptions,
            readOnly,
            validate,
            validateStringMaxLength,
            capitalize,
            hideIfEmpty,
            shouldHide,
            loadingMessage,
            type,
          }]) =>
            (
              (!hideIfEmpty || formData[key]) &&
              !shouldHide?.(formData)
            ) &&
              <FieldSetWithStatus
                key={key}
                id={key}
                label={label}
                note={note}
                error={formErrors[key]}
                value={formData[key] ?? ''}
                onChange={value => {
                  setFormData({ ...formData, [key]: value });
                  if (validate) {
                    setFormErrors({ ...formErrors, [key]: validate(value) });
                  } else if (validateStringMaxLength !== undefined) {
                    setFormErrors({
                      ...formErrors,
                      [key]: value.length > validateStringMaxLength
                        ? `${validateStringMaxLength} characters or less`
                        : undefined,
                    });
                  }
                  if (key === 'title') {
                    onTitleChange?.(value.trim());
                  }
                }}
                selectOptions={selectOptions}
                selectOptionsDefaultLabel={selectOptionsDefaultLabel}
                tagOptions={tagOptions}
                required={required}
                readOnly={readOnly}
                capitalize={capitalize}
                placeholder={loadingMessage && !formData[key]
                  ? loadingMessage
                  : undefined}
                loading={loadingMessage && !formData[key] ? true : false}
                type={type}
              />)}
        <div className="flex gap-3">
          <Link
            className="button"
            href={type === 'edit' ? PATH_ADMIN_PHOTOS : PATH_ADMIN_UPLOADS}
          >
            Cancel
          </Link>
          <SubmitButtonWithStatus
            disabled={!isFormValid(formData)}
            onFormStatusChange={onFormStatusChange}
          >
            {type === 'create' ? 'Create' : 'Update'}
          </SubmitButtonWithStatus>
        </div>
      </form>
    </div>
  );
};
