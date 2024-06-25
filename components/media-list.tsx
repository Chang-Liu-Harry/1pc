"use client";

import { Grid } from "@radix-ui/themes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/image-upload";
import { useCallback, useState } from "react";
import axios from "axios";
import { Mind } from "@prisma/client";
import { useRouter } from "next/navigation";

interface MediaListProps {
  mind: Mind;
  isAdmin: boolean;
}

export const MediaList: React.FC<MediaListProps> = ({ mind, isAdmin }) => {
  const [openImage, setOpenImage] = useState("");
  const router = useRouter();

  const onChange = useCallback(
    async (url: string) => {
      const {
        categoryId,
        src,
        name,
        description,
        instructions,
        seed,
        styleTag,
        characterTag,
        customPrompt,
        medias,
      } = mind;
      await axios.patch(`/api/mind/${mind.id}`, {
        categoryId,
        src,
        name,
        description,
        instructions,
        seed,
        styleTag,
        characterTag,
        customPrompt,
        medias: [...medias, url],
      });
      router.refresh();
    },
    [mind]
  );

  return (
    <div className="flex-1 px-3">
      <div className="bg-pink-200 rounded-sm">
        <div className="p-3 border-b border-stone-50">
          <div className="text-xl font-bold">Media</div>
          <h2 className="text-sm text-regular">
            Browse available photos and videos
          </h2>
        </div>
        <Grid className="p-3" columns={"3"} gap={"3"}>
          {mind.medias.map((i) => (
            <img
              onClick={() => setOpenImage(i)}
              key={i}
              className="rounded-sm cursor-pointer object-cover"
              src={i}
              alt=""
            />
          ))}

          {isAdmin && <ImageUpload onChange={onChange} value={""} />}
        </Grid>
        {!mind.medias.length && (
          <div className="text-center pb-6 text-slate-600">No media available</div>
        )}

        <Dialog open={!!openImage} onOpenChange={() => setOpenImage("")}>
          <DialogContent>
            <img src={openImage} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
