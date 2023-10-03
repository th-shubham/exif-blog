import {
  getPhotosCached,
  getPhotosCountCached,
  getUniqueCamerasCached,
  getUniqueTagsCached,
} from '@/cache';
import HeaderList from '@/components/HeaderList';
import MorePhotos from '@/components/MorePhotos';
import SiteGrid from '@/components/SiteGrid';
import { generateOgImageMetaForPhotos, getPhotosLimitForQuery } from '@/photo';
import PhotoCamera from '@/camera/PhotoCamera';
import PhotoGrid from '@/photo/PhotoGrid';
import PhotosEmptyState from '@/photo/PhotosEmptyState';
import { MAX_PHOTOS_TO_SHOW_HOME } from '@/photo/image-response';
import { pathForGrid } from '@/site/paths';
import PhotoTag from '@/tag/PhotoTag';
import { Metadata } from 'next';
import { FaTag } from 'react-icons/fa';
import { IoMdCamera } from 'react-icons/io';

export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const photos = await getPhotosCached({ limit: MAX_PHOTOS_TO_SHOW_HOME});
  return generateOgImageMetaForPhotos(photos);
}

export default async function GridPage({
  searchParams,
}: {
  searchParams: { next: string };
}) {
  const { offset, limit } = getPhotosLimitForQuery(searchParams.next);

  const [
    photos,
    count,
    tags,
    cameras,
  ] = await Promise.all([
    getPhotosCached({ limit }),
    getPhotosCountCached(),
    getUniqueTagsCached(),
    getUniqueCamerasCached(),
  ]);

  const showMorePhotos = count > photos.length;
  
  return (
    photos.length > 0
      ? <SiteGrid
        contentMain={<div className="space-y-4">
          <PhotoGrid photos={photos} />
          {showMorePhotos &&
            <MorePhotos path={pathForGrid(offset + 1)} />}
        </div>}
        contentSide={<div className="sticky top-4 space-y-4">
          {tags.length > 0 && <HeaderList
            title='Tags'
            icon={<FaTag size={12} />}
            items={tags.map(tag =>
              <PhotoTag
                key={tag}
                tag={tag}
                showIcon={false}
              />)}
          />}
          {cameras.length > 0 && <HeaderList
            title="Cameras"
            icon={<IoMdCamera size={13} />}
            items={cameras.map(({ cameraKey, camera }) =>
              <PhotoCamera
                key={cameraKey}
                camera={camera}
                showIcon={false}
                hideApple
              />)}
          />}
        </div>}
        sideHiddenOnMobile
      />
      : <PhotosEmptyState />
  );
}
