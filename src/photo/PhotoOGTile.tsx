'use client';

import { useEffect, useState } from 'react';
import { Photo, ogImageDescriptionForPhoto, ogImageUrlForPhoto } from '@/photo';
import { cc } from '@/utility/css';
import Link from 'next/link';
import { BiError } from 'react-icons/bi';
import Spinner from '@/components/Spinner';
import { IMAGE_OG_HEIGHT, IMAGE_OG_RATIO, IMAGE_OG_WIDTH } from '@/site';
import { routeForPhoto } from '@/site/routes';

export type OGLoadingState = 'unloaded' | 'loading' | 'loaded' | 'failed';

export default function PhotoOGTile({
  photo,
  loadingState: loadingStateExternal,
  riseOnHover,
  onLoad,
  onFail,
  retryTime,
}: {
  photo: Photo
  loadingState?: OGLoadingState
  onLoad?: () => void
  onFail?: () => void
  riseOnHover?: boolean
  retryTime?: number
}) {
  const [loadingStateInternal, setLoadingStateInternal] =
    useState(loadingStateExternal ?? 'unloaded');

  const loadingState = loadingStateExternal ?? loadingStateInternal;

  useEffect(() => {
    if (
      !loadingStateExternal &&
      loadingStateInternal === 'unloaded'
    ) {
      setLoadingStateInternal('loading');
    }
  }, [loadingStateExternal, loadingStateInternal]);

  return (
    <Link
      key={photo.id}
      href={routeForPhoto(photo)}
      className={cc(
        'block w-full rounded-md overflow-hidden',
        'border shadow-sm',
        'border-gray-200 dark:border-gray-800',
        riseOnHover && 'hover:-translate-y-1.5 transition-transform',
      )}
    >
      <div
        className="relative"
        style={{ aspectRatio: IMAGE_OG_RATIO }}
      >
        {loadingState === 'loading' &&
          <div className={cc(
            'absolute top-0 left-0 right-0 bottom-0 z-10',
            'flex items-center justify-center',
          )}>
            <Spinner />
          </div>}
        {loadingState === 'failed' &&
          <div className={cc(
            'absolute top-0 left-0 right-0 bottom-0 z-[11]',
            'flex items-center justify-center',
            'text-red-400',
          )}>
            <BiError size={32} />
          </div>}
        {(loadingState === 'loading' || loadingState === 'loaded') &&
          <img
            alt={`OG Image: ${photo.idShort}`}
            className={cc(
              'absolute top-0 left-0 right-0 bottom-0 z-0',
              'w-full',
              loadingState === 'loading' && 'opacity-0',
              'transition-opacity',
            )}
            src={ogImageUrlForPhoto(photo)}
            width={IMAGE_OG_WIDTH}
            height={IMAGE_OG_HEIGHT}
            onLoad={() => {
              if (onLoad) {
                onLoad();
              } else {
                setLoadingStateInternal('loaded');
              }
            }}
            onError={() => {
              if (onFail) {
                onFail();
              } else {
                setLoadingStateInternal('failed');
              }
              if (retryTime !== undefined) {
                setTimeout(() => {
                  setLoadingStateInternal('loading');
                }, retryTime);
              }
            }}
          />}
      </div>
      <div className={cc(
        'md:text-lg',
        'flex flex-col gap-1 p-3',
        'font-sans leading-none',
        'bg-gray-50 dark:bg-gray-900/50',
        'border-t border-gray-200 dark:border-gray-800',
      )}>
        <div className="text-gray-800 dark:text-white font-medium">
          {photo.title}
        </div>
        <div className="text-gray-500">
          {ogImageDescriptionForPhoto(photo)}
        </div>
      </div>
    </Link>
  );
};
