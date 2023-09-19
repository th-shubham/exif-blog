import { Photo, dateRangeForPhotos } from '@/photo';
import { cc } from '@/utility/css';
import PhotoTag from './PhotoTag';
import { descriptionForTaggedPhotos } from '.';

export default function TagHeader({
  tag,
  photos,
  selectedPhoto,
}: {
  tag: string
  photos: Photo[]
  selectedPhoto?: Photo
}) {
  const { start, end } = dateRangeForPhotos(photos);

  const selectedPhotoIndex = selectedPhoto
    ? photos.findIndex(photo => photo.id === selectedPhoto.id)
    : undefined;

  return (
    <div className={cc(
      'flex flex-col gap-y-0.5',
      'xs:grid grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4',
    )}>
      <PhotoTag tag={tag} />
      <span className={cc(
        'uppercase text-gray-400 dark:text-gray-500',
        'sm:col-span-2 md:col-span-1 lg:col-span-2',
      )}>
        {selectedPhotoIndex !== undefined
          ? `Tagged photo ${selectedPhotoIndex + 1} of ${photos.length}`
          : descriptionForTaggedPhotos(photos)}
      </span>
      <span className={cc(
        'hidden sm:inline-block',
        'text-right uppercase',
        'text-gray-400 dark:text-gray-500',
      )}>
        {start === end
          ? start
          : <>{start}<br />– {end}</>}
      </span>
    </div>
  );
}
