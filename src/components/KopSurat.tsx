import React from "react";

export default function KopSurat() {
  return (
    <div className="flex flex-col items-center justify-between w-full border-b-[3px] border-double border-slate-900 pb-3 mb-6 font-display text-slate-950">
      <div className="flex items-center justify-between w-full">
        {/* Left Logo: Lambang Jawa Timur */}
        <div className="flex-shrink-0 w-20 h-20 mr-2 flex items-center justify-center">
          <img
            src="../../assets/image/logoJatim.png"
            alt="Logo jatim"
            className="w-18 h-18 object-contain"
          />
        </div>

        {/* Center Text */}
        <div className="flex-1 text-center select-none">
          <h2 className="text-sm md:text-[15px] font-semibold tracking-wider uppercase leading-tight">
            Pemerintah Provinsi Jawa Timur
          </h2>
          <h2 className="text-xs md:text-[14px] tracking-wide uppercase leading-tight font-medium">
            Dinas Pendidikan
          </h2>
          <h1 className="text-lg md:text-2xl font-extrabold tracking-widest uppercase leading-snug mt-0.5">
            SMA Negeri 1 Kediri
          </h1>
        </div>

        {/* Right Logo: Logo SMAN 1 Kediri */}
        <div className="flex-shrink-0 w-20 h-20 ml-2 flex items-center justify-center">
          <img
            src="../../assets/image/logoSmast.png"
            alt="Logo SMA N 1 Kediri"
            className="w-18 h-18 object-contain"
          />
        </div>
      </div>

      {/* Address Bar - Boxed border exactly like the original image */}
      <div className="w-full border border-slate-900 mt-2 px-3 py-1.5 text-center text-[10px] md:text-xs leading-tight tracking-normal font-sans">
        <span className="font-semibold">Jalan Veteran Nomor 1</span>
        <span className="mx-2">|</span>
        <span>Telp. (0354) 771829 Kediri</span>
        <span className="mx-2">|</span>
        <span>website: <a href="https://smastkediri.sch.id/" className="no-underline font-medium">www.smastkediri.sch.id</a></span>
        <span className="mx-2">|</span>
        <span>email: <span className="no-underline font-medium">redaksi@smastkediri.sch.id</span></span>
      </div>
    </div>
  );
}
