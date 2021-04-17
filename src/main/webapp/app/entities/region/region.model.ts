import * as dayjs from 'dayjs';

export interface IRegion {
  id?: number;
  regionName?: string;
  regionDesc?: string | null;
  creationDate?: dayjs.Dayjs | null;
  logoContentType?: string | null;
  logo?: string | null;
}

export class Region implements IRegion {
  constructor(
    public id?: number,
    public regionName?: string,
    public regionDesc?: string | null,
    public creationDate?: dayjs.Dayjs | null,
    public logoContentType?: string | null,
    public logo?: string | null
  ) {}
}

export function getRegionIdentifier(region: IRegion): number | undefined {
  return region.id;
}
