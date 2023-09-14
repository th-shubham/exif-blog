import { auth } from '@/auth';
import { getImageCacheHeadersForAuth } from '@/cache';
import HomeImageResponse from '@/photo/image-response/HomeImageResponse';
import { getPhotos } from '@/services/postgres';
import { IMAGE_OG_SMALL_HEIGHT, IMAGE_OG_SMALL_WIDTH } from '@/site';
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const photos = await getPhotos();
  const headers = await getImageCacheHeadersForAuth(await auth());

  return new ImageResponse(
    (
      <HomeImageResponse {...{
        photos,
        request,
        width: IMAGE_OG_SMALL_WIDTH,
        height: IMAGE_OG_SMALL_HEIGHT,
      }}/>
    ),
    {
      width: IMAGE_OG_SMALL_WIDTH,
      height: IMAGE_OG_SMALL_HEIGHT,
      headers,
    },
  );
}
