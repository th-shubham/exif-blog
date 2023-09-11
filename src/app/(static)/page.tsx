import AnimateItems from '@/components/AnimateItems';
import MorePhotos from '@/components/MorePhotos';
import SiteGrid from '@/components/SiteGrid';
import { generateImageMetaForPhoto, getPhotosLimitForQuery } from '@/photo';
import PhotoLarge from '@/photo/PhotoLarge';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { getPhotos, getPhotosCount } from '@/services/postgres';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotos();
  return generateImageMetaForPhoto(photos[0]);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { next: string };
}) {
  const { offset, limit } = getPhotosLimitForQuery(searchParams.next);

  const photos = await getPhotos(undefined, limit);

  const count = await getPhotosCount();

  const showMorePhotos = count > photos.length;

  return (
    photos.length > 0
      ? <div className="space-y-4">
        <AnimateItems
          className="space-y-2"
          duration={0.7}
          staggerDelay={0.15}
          distanceOffset={0}
          staggerOnFirstLoadOnly
          items={photos.map((photo, index) =>
            <PhotoLarge
              key={photo.id}
              photo={photo}
              priority={index <= 1}
            />)}
        />
        {showMorePhotos &&
          <SiteGrid
            contentMain={<MorePhotos path={`?next=${offset + 1}`} />}
          />}
      </div>
      : <PhotosEmptyState />
  );
}
