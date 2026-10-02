import { useRef, useState } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { useLanguage } from "../i18n/LanguageProvider";
import { compressImageToDataUrl, validateImageFile } from "../lib/image";
import { makeId } from "../lib/id";
import { MAX_BOUQUET_PHOTOS } from "../lib/bouquetPhotos";
import type { BouquetPhoto } from "../types";

export async function preparePhotos(files: File[], currentCount: number): Promise<BouquetPhoto[]> {
  if(currentCount+files.length>MAX_BOUQUET_PHOTOS)throw new Error("photo-limit");
  files.forEach(validateImageFile);
  const photos: BouquetPhoto[]=[];
  // Sequential decoding limits peak memory on mobile; no partial batch is committed.
  for(const file of files)photos.push({id:makeId(),url:await compressImageToDataUrl(file)});
  return photos;
}
export function BouquetPhotoEditor({photos,onChange,disabled=false,onBusyChange}: {photos:BouquetPhoto[];onChange:(photos:BouquetPhoto[])=>void;disabled?:boolean;onBusyChange?:(busy:boolean)=>void}) {
  const {language}=useLanguage();const vi=language==='vi';
  const [busy,setBusy]=useState(false);const busyRef=useRef(false);const [error,setError]=useState<string|null>(null);
  async function add(files:File[]) {
    if(busyRef.current||disabled)return;
    busyRef.current=true;setBusy(true);onBusyChange?.(true);setError(null);
    try{onChange([...photos,...await preparePhotos(files,photos.length)]);}
    catch(e){setError(e instanceof Error && e.message==='photo-limit' ? (vi?'Mỗi bó hoa tối đa 10 ảnh.':'Up to 10 photos per bouquet.') : (vi?'Không thể thêm ảnh. Mỗi ảnh cần là ảnh hợp lệ và không quá 12 MB. Hãy thử lại.':'Could not add photos. Use valid images up to 12 MB each, then try again.'));}
    finally{busyRef.current=false;setBusy(false);onBusyChange?.(false);}
  }
  return <fieldset disabled={disabled||busy} className="min-w-0 space-y-3">
    <legend className="text-sm font-medium text-[var(--color-ink)]">{vi?'Ảnh bó hoa':'Bouquet photos'} · {photos.length}/10</legend>
    <p className="text-xs text-[var(--color-muted)]">{vi?'Ảnh chính hiển thị đầu tiên và đại diện cho bó hoa trong vườn.':'The cover appears first and represents this bouquet in your garden.'}</p>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {photos.map((photo,i)=><div key={photo.id} className="relative w-24 shrink-0 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        <img src={photo.url} alt={`${vi?'Ảnh':'Photo'} ${i+1}`} className="h-24 w-full object-cover"/>
        <button type="button" disabled={photos.length===1||disabled||busy} onClick={()=>onChange(photos.filter(p=>p.id!==photo.id))} aria-label={`${vi?'Xóa ảnh':'Remove photo'} ${i+1}`} className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 disabled:opacity-30"><X size={15}/></button>
        <button type="button" onClick={()=>onChange([photo,...photos.filter(p=>p.id!==photo.id)])} aria-pressed={i===0} className="flex min-h-11 w-full items-center justify-center gap-1 px-1 text-[11px] text-[var(--color-rose)]"><Star size={12} fill={i===0?'currentColor':'none'}/>{i===0?(vi?'Ảnh chính':'Cover'):(vi?'Đặt ảnh chính':'Make cover')}</button>
      </div>)}
    </div>
    <ImageUploader disabled={disabled||busy||photos.length>=MAX_BOUQUET_PHOTOS} onFilesSelected={add}><ImagePlus size={16}/>{busy?(vi?'Đang xử lý ảnh…':'Preparing photos…'):(vi?'Thêm ảnh':'Add photos')}</ImageUploader>
    {error&&<p role="alert" className="text-sm text-[var(--color-rose)]">{error}</p>}
  </fieldset>;
}
