import { auth } from '@/auth';
import { getImageCacheHeadersForAuth, getPhotoCached } from '@/cache';
import { IMAGE_OG_SIZE } from '@/photo/image-response';
import PhotoImageResponse from '@/photo/image-response/PhotoImageResponse';
import { getIBMPlexMonoMedium } from '@/site/font';
import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request, context: any){
  const [
    photo,
    { fontFamily, fonts },
    headers,
  ] = await Promise.all([
    getPhotoCached(context.params.photoId),
    getIBMPlexMonoMedium(),
    getImageCacheHeadersForAuth(await auth()),
  ]);
  
  if (!photo) { return new Response('Photo not found', { status: 404 }); }

  const { width, height } = IMAGE_OG_SIZE;
  
  return new ImageResponse(
    <PhotoImageResponse {...{ photo, request, width, height, fontFamily }} />,
    { width, height, fonts, headers },
  );
}
