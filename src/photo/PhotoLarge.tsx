import { Photo, titleForPhoto } from '.';
import SiteGrid from '@/components/SiteGrid';
import ImageLarge from '@/components/ImageLarge';
import { cc } from '@/utility/css';
import Link from 'next/link';
import { routeForPhoto } from '@/site/routes';
import SharePhotoButton from './SharePhotoButton';
import { FaTag } from 'react-icons/fa';

export default function PhotoLarge({
  photo,
  priority,
  prefetchShare,
}: {
  photo: Photo
  priority?: boolean
  prefetchShare?: boolean
}) {
  const renderMiniGrid = (children: JSX.Element) =>
    <div className={cc(
      'flex gap-y-4',
      'flex-col sm:flex-row md:flex-col',
      '[&>*]:sm:flex-grow',
      'pr-2',
    )}>
      {children}
    </div>;

  return (
    <SiteGrid
      contentMain={
        <ImageLarge
          className="w-full"
          alt={titleForPhoto(photo)}
          href={routeForPhoto(photo)}
          src={photo.url}
          aspectRatio={photo.aspectRatio}
          blurData={photo.blurData}
          priority={priority}
        />}
      contentSide={
        <div className={cc(
          'sticky top-4 self-start',
          'grid grid-cols-2 md:grid-cols-1',
          'gap-y-4',
          '-translate-y-1',
          'mb-4',
        )}>
          {renderMiniGrid(<>
            <Link
              href={routeForPhoto(photo)}
              className="font-bold uppercase"
            >
              {titleForPhoto(photo)}
            </Link>
            {photo.tags.length > 0 &&
              <div className="uppercase">
                {photo.tags.map(tag =>
                  <div
                    className="flex items-center gap-x-1.5"
                    key={tag}
                  >
                    <FaTag size={11} />
                    <span>{tag}</span>
                  </div>)}
              </div>}
            <div className="uppercase">
              {photo.make} {photo.model}
            </div>
          </>)}
          {renderMiniGrid(<>
            <ul className={cc(
              'text-gray-500',
              'dark:text-gray-400',
            )}>
              <li>
                {photo.focalLengthFormatted}
                {' '}
                <span className={cc(
                  'text-gray-400/80',
                  'dark:text-gray-400/50',
                )}>
                  {photo.focalLengthIn35MmFormatFormatted}
                </span>
              </li>
              <li>{photo.fNumberFormatted}</li>
              <li>{photo.isoFormatted}</li>
              <li>{photo.exposureTimeFormatted}</li>
              <li>{photo.exposureCompensationFormatted ?? '—'}</li>
            </ul>
            <div className={cc(
              'uppercase',
              'text-gray-500',
              'dark:text-gray-400',
            )}>
              {photo.takenAtNaiveFormatted}
            </div>
            <div className="-translate-x-1">
              <SharePhotoButton
                photo={photo}
                prefetch={prefetchShare}
              />
            </div>
          </>)}
        </div>}
    />
  );
};
