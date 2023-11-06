import {
  Photo,
  PhotoDateRange,
  descriptionForPhotoSet,
  photoQuantityText,
} from '@/photo';
import {
  absolutePathForFilmSimulation,
  absolutePathForFilmSimulationImage,
} from '@/site/paths';
import {
  FujifilmSimulation,
  labelForFilmSimulation,
} from '@/vendors/fujifilm';

export type FilmSimulation = FujifilmSimulation;

export type FilmSimulations = {
  simulation: FilmSimulation
  count: number
}[]

export const titleForFilmSimulation = (
  simulation: FilmSimulation,
  photos:Photo[],
  explicitCount?: number,
) => [
  labelForFilmSimulation(simulation).large,
  photoQuantityText(explicitCount ?? photos.length),
].join(' ');

export const descriptionForFilmSimulationPhotos = (
  photos: Photo[],
  dateBased?: boolean,
  explicitCount?: number,
  explicitDateRange?: PhotoDateRange,
) =>
  descriptionForPhotoSet(
    photos,
    undefined,
    dateBased,
    explicitCount,
    explicitDateRange,
  );

export const generateMetaForFilmSimulation = (
  simulation: FilmSimulation,
  photos: Photo[],
  explicitCount?: number,
  explicitDateRange?: PhotoDateRange,
) => ({
  url: absolutePathForFilmSimulation(simulation),
  title: titleForFilmSimulation(simulation, photos, explicitCount),
  description: descriptionForFilmSimulationPhotos(
    photos,
    true,
    explicitCount,
    explicitDateRange,
  ),
  images: absolutePathForFilmSimulationImage(simulation),
});
