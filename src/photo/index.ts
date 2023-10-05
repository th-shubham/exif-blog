import { ABSOLUTE_PATH_FOR_HOME_IMAGE } from '@/site/paths';
import { formatDateFromPostgresString } from '@/utility/date';
import {
  formatAperture,
  formatIso,
  formatExposureCompensation,
  formatExposureTime,
  formatFocalLength,
} from '@/utility/exif';
import camelcaseKeys from 'camelcase-keys';
import type { Metadata } from 'next';

export const GRID_THUMBNAILS_TO_SHOW_MAX = 12;

// Core EXIF data
export interface PhotoExif {
  aspectRatio: number
  make?: string
  model?: string
  focalLength?: number
  focalLengthIn35MmFormat?: number
  fNumber?: number
  iso?: number
  exposureTime?: number
  exposureCompensation?: number
  latitude?: number
  longitude?: number
  filmSimulation?: string
  takenAt: string
  takenAtNaive: string
}

// Raw db insert
export interface PhotoDbInsert extends PhotoExif {
  id: string
  url: string
  extension: string
  blurData: string
  title?: string
  tags?: string[]
  locationName?: string
  priorityOrder?: number
  hidden?: boolean
}

// Raw db response
export interface PhotoDb extends Omit<PhotoDbInsert, 'takenAt' | 'tags'> {
  updatedAt: Date
  createdAt: Date
  takenAt: Date
  tags: string[]
}

// Parsed db response
export interface Photo extends PhotoDb {
  focalLengthFormatted?: string
  focalLengthIn35MmFormatFormatted?: string
  fNumberFormatted?: string
  isoFormatted?: string
  exposureTimeFormatted?: string
  exposureCompensationFormatted?: string
  takenAtNaiveFormatted: string
}

export const parsePhotoFromDb = (photoDbRaw: PhotoDb): Photo => {
  const photoDb = camelcaseKeys(
    photoDbRaw as unknown as Record<string, unknown>
  ) as unknown as PhotoDb;
  return {
    ...photoDb,
    tags: photoDb.tags ?? [],
    focalLengthFormatted:
      formatFocalLength(photoDb.focalLength),
    focalLengthIn35MmFormatFormatted:
      formatFocalLength(photoDb.focalLengthIn35MmFormat),
    fNumberFormatted:
      formatAperture(photoDb.fNumber),
    isoFormatted:
      formatIso(photoDb.iso),
    exposureTimeFormatted:
      formatExposureTime(photoDb.exposureTime),
    exposureCompensationFormatted:
      formatExposureCompensation(photoDb.exposureCompensation),
    takenAtNaiveFormatted:
      formatDateFromPostgresString(photoDb.takenAtNaive),
  };
};

export const parseCachedPhotoDates = (photo: Photo) => ({
  ...photo,
  takenAt: new Date(photo.takenAt),
  updatedAt: new Date(photo.updatedAt),
  createdAt: new Date(photo.createdAt),
});

export const parseCachedPhotosDates = (photos: Photo[]) =>
  photos.map(parseCachedPhotoDates);

export const convertPhotoToPhotoDbInsert = (
  photo: Photo,
): PhotoDbInsert => ({
  ...photo,
  takenAt: photo.takenAt.toISOString(),
});

export const photoStatsAsString = (photo: Photo) => [
  photo.model,
  photo.focalLengthFormatted,
  photo.fNumberFormatted,
  photo.isoFormatted,
].join(' ');

export const descriptionForPhoto = (photo: Photo) =>
  photo.takenAtNaiveFormatted?.toUpperCase();

export const getPreviousPhoto = (photo: Photo, photos: Photo[]) => {
  const index = photos.findIndex(p => p.id === photo.id);
  return index > 0
    ? photos[index - 1]
    : undefined;
};

export const getNextPhoto = (photo: Photo, photos: Photo[]) => {
  const index = photos.findIndex(p => p.id === photo.id);
  return index < photos.length - 1
    ? photos[index + 1]
    : undefined;
};

export const generateOgImageMetaForPhotos = (photos: Photo[]): Metadata => {
  if (photos.length > 0) {
    return {
      openGraph: {
        images: ABSOLUTE_PATH_FOR_HOME_IMAGE,
      },
      twitter: {
        card: 'summary_large_image',
        images: ABSOLUTE_PATH_FOR_HOME_IMAGE,
      },
    };
  } else {
    // If there are no photos, refrain from showing an OG image
    return {};
  }
};

const PHOTO_ID_FORWARDING_TABLE: Record<string, string> = JSON.parse(
  process.env.PHOTO_ID_FORWARDING_TABLE || '{}'
);

export const translatePhotoId = (id: string) =>
  PHOTO_ID_FORWARDING_TABLE[id] || id;

export const titleForPhoto = (photo: Photo) =>
  photo.title || 'Untitled';

const photoLabelForCount = (count: number) =>
  count === 1 ? 'Photo' : 'Photos';

export const photoQuantityText = (count: number) =>
  `(${count} ${photoLabelForCount(count)})`;

export type PhotoDateRange = { start: string, end: string };

export const descriptionForPhotoSet = (
  photos:Photo[],
  descriptor?: string,
  dateBased?: boolean,
  explicitCount?: number,
  explicitDateRange?: PhotoDateRange,
) =>
  dateBased
    ? dateRangeForPhotos(photos, explicitDateRange).description.toUpperCase()
    : [
      explicitCount ?? photos.length,
      descriptor,
      photoLabelForCount(explicitCount ?? photos.length),
    ].join(' ');

export const dateRangeForPhotos = (
  photos: Photo[],
  explicitDateRange?: PhotoDateRange,
) => {
  const start = formatDateFromPostgresString(
    explicitDateRange?.start ?? photos[0].takenAtNaive,
    true,
  );
  const end = formatDateFromPostgresString(
    explicitDateRange?.end ?? photos[photos.length - 1].takenAtNaive,
    true
  );
  const description = start === end
    ? start
    : `${start}–${end}`;
  return { start, end, description };
};
