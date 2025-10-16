// app/api/_utils/merch.ts
import type { Merch } from '@/types/db';

type MerchDB = {
  ItemID: number;
  Title: string;
  Description: string | null;
  Price: number;
  Status: string;

  ContactName: string | null;
  ContactLineID: string | null;

  PosterURL: string | null;
  FrontViewURL: string | null;
  BackViewURL: string | null;
  SizeChartURL: string | null;
  MiscURLs: string[] | null;
};

export function dbToApi(row: MerchDB): Merch {
  return {
    itemId: row.ItemID,
    title: row.Title,
    description: row.Description,
    price: row.Price,
    status: row.Status,
    contactName: row.ContactName,
    contactLineId: row.ContactLineID,
    posterUrl: row.PosterURL,
    frontViewUrl: row.FrontViewURL,
    backViewUrl: row.BackViewURL,
    sizeChartUrl: row.SizeChartURL,
    miscUrls: row.MiscURLs,
  };
}

export function apiToDb(body: Partial<Merch>): Partial<MerchDB> {
  const out: Partial<MerchDB> = {};
  if (body.title !== undefined) out.Title = body.title;
  if (body.description !== undefined) out.Description = body.description ?? null;
  if (body.price !== undefined) out.Price = Number(body.price);
  if (body.status !== undefined) out.Status = String(body.status);

  if (body.contactName !== undefined) out.ContactName = body.contactName ?? null;
  if (body.contactLineId !== undefined) out.ContactLineID = body.contactLineId ?? null;

  if (body.posterUrl !== undefined) out.PosterURL = body.posterUrl ?? null;
  if (body.frontViewUrl !== undefined) out.FrontViewURL = body.frontViewUrl ?? null;
  if (body.backViewUrl !== undefined) out.BackViewURL = body.backViewUrl ?? null;
  if (body.sizeChartUrl !== undefined) out.SizeChartURL = body.sizeChartUrl ?? null;
  if (body.miscUrls !== undefined) out.MiscURLs = body.miscUrls ?? null;

  return out;
}
