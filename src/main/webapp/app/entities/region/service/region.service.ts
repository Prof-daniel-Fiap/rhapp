import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRegion, getRegionIdentifier } from '../region.model';

export type EntityResponseType = HttpResponse<IRegion>;
export type EntityArrayResponseType = HttpResponse<IRegion[]>;

@Injectable({ providedIn: 'root' })
export class RegionService {
  public resourceUrl = this.applicationConfigService.getEndpointFor('api/regions');

  constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(region: IRegion): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(region);
    return this.http
      .post<IRegion>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(region: IRegion): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(region);
    return this.http
      .put<IRegion>(`${this.resourceUrl}/${getRegionIdentifier(region) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(region: IRegion): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(region);
    return this.http
      .patch<IRegion>(`${this.resourceUrl}/${getRegionIdentifier(region) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IRegion>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IRegion[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addRegionToCollectionIfMissing(regionCollection: IRegion[], ...regionsToCheck: (IRegion | null | undefined)[]): IRegion[] {
    const regions: IRegion[] = regionsToCheck.filter(isPresent);
    if (regions.length > 0) {
      const regionCollectionIdentifiers = regionCollection.map(regionItem => getRegionIdentifier(regionItem)!);
      const regionsToAdd = regions.filter(regionItem => {
        const regionIdentifier = getRegionIdentifier(regionItem);
        if (regionIdentifier == null || regionCollectionIdentifiers.includes(regionIdentifier)) {
          return false;
        }
        regionCollectionIdentifiers.push(regionIdentifier);
        return true;
      });
      return [...regionsToAdd, ...regionCollection];
    }
    return regionCollection;
  }

  protected convertDateFromClient(region: IRegion): IRegion {
    return Object.assign({}, region, {
      creationDate: region.creationDate?.isValid() ? region.creationDate.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.creationDate = res.body.creationDate ? dayjs(res.body.creationDate) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((region: IRegion) => {
        region.creationDate = region.creationDate ? dayjs(region.creationDate) : undefined;
      });
    }
    return res;
  }
}
