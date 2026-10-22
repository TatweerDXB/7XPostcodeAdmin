import { apiClient, RequestOptions } from "./apiClient";
import { BaseResponse, GridCellDetailDto } from "./gridService";

export interface PostcodeRowDto {
  postcode: string;
  postcodeDisplay: string;
  gridId: string;
  centroidLatitude: number;
  centroidLongitude: number;
  emirateCode?: string;
  localityNameEn?: string;
  localityNameAr?: string;
  [key: string]: unknown;
}

export interface PostcodeSearchParams {
  search?: string;
  emirate?: string;
  bbox?: string;
  Page?: number;
  PageSize?: number;
}

export const postcodeService = {
  /**
   * Searches postcodes with prefix or filters
   * GET /api/postcodes
   */
  searchPostcodes: async (
    params?: PostcodeSearchParams,
    options?: RequestOptions
  ): Promise<BaseResponse<PostcodeRowDto[]>> => {
    return apiClient.get<BaseResponse<PostcodeRowDto[]>>("/api/postcodes", {
      ...options,
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Retrieves postcode details including grid cell and full hierarchy
   * GET /api/postcodes/{postcode}
   */
  getPostcodeDetail: async (
    postcode: string,
    options?: RequestOptions
  ): Promise<BaseResponse<GridCellDetailDto>> => {
    return apiClient.get<BaseResponse<GridCellDetailDto>>(
      `/api/postcodes/${encodeURIComponent(postcode)}`,
      options
    );
  },
};
