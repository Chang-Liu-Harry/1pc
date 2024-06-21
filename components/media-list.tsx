"use client";

import { Grid } from "@radix-ui/themes";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState } from "react";

export const MediaList = () => {
  const [openImage, setOpenImage] = useState('');
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
          {[1, 2, 3, 4, 5].map((i) => (
            <img
              onClick={() => setOpenImage('https://www.lushchat.ai/_next/image?url=https%3A%2F%2Fimagedelivery.net%2F6Kja4aObvnya97est2s4Cw%2Fc66b9fd1-86c6-4c55-d360-f674f52b1300%2Fpublic&w=2048&q=75')}
              key={i}
              className="rounded-sm cursor-pointer	"
              src="https://www.lushchat.ai/_next/image?url=https%3A%2F%2Fimagedelivery.net%2F6Kja4aObvnya97est2s4Cw%2Fc66b9fd1-86c6-4c55-d360-f674f52b1300%2Fpublic&w=2048&q=75"
              alt=""
            />
          ))}
        </Grid>

        <Dialog open={!!openImage} onOpenChange={() => setOpenImage('')}>
          <DialogContent>
            <img src={openImage}/>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
