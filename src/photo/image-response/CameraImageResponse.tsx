import { Photo } from '..';
import ImageCaption from './components/ImageCaption';
import ImagePhotoGrid from './components/ImagePhotoGrid';
import ImageContainer from './components/ImageContainer';
import { Camera, cameraFromPhoto } from '@/camera';
import { IoMdCamera } from 'react-icons/io';

export default function CameraImageResponse({
  camera: cameraProp,
  photos,
  width,
  height,
  fontFamily,
}: {
  camera: Camera
  photos: Photo[]
  width: number
  height: number
  fontFamily: string
}) {
  const { make, model } = cameraFromPhoto(photos[0], cameraProp);
  return (
    <ImageContainer {...{
      width,
      height,
      ...photos.length === 0 && { background: 'black' },
    }}>
      <ImagePhotoGrid
        {...{
          photos,
          width,
          height,
        }}
      />
      <ImageCaption {...{ width, height, fontFamily }}>
        <IoMdCamera size={height * .09} />
        <span style={{textTransform: 'uppercase'}}>
          {make.toLowerCase() !== 'apple' && make}
          {model}
        </span>
      </ImageCaption>
    </ImageContainer>
  );
}
