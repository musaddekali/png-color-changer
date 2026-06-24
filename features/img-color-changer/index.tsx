"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type RGB = {
  r: number;
  g: number;
  b: number;
};

export default function ImgColorChangerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [color, setColor] = useState<string>("#ff0000");
  const [hexColor, setHexColor] = useState<string>("#ff0000");
  const [mode, setMode] = useState<"all" | "nonTransparent">("all");

  const hexToRgb = (hex: string): RGB => {
    const bigint = parseInt(hex.slice(1), 16);

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const applyColor = (): void => {
    const canvas = canvasRef.current;
    const img = imgRef.current;

    if (!canvas || !img?.src) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const rgb = hexToRgb(color);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];

      if (mode === "all") {
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      } else if (mode === "nonTransparent" && alpha > 0) {
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result;

      if (typeof result !== "string") return;

      const img = new Image();

      img.onload = () => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        imgRef.current = img;

        ctx.drawImage(img, 0, 0);
        applyColor();
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleColorPickerChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;

    setColor(value);
    setHexColor(value);
  };

  const handleHexChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;

    setHexColor(value);

    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      setColor(value);
    }
  };

  const handleModeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setMode(e.target.value as "all" | "nonTransparent");
  };

  const downloadImage = (): void => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const link = document.createElement("a");

    link.download = "colored-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    applyColor();
  }, [color, mode]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-8">
      <div className="container">
        <Card>
          <CardContent>
            <h2 className="mb-5 text-3xl font-bold">Image Color Changer</h2>

            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleUpload}
              className="mb-4"
            />

            <br />

            <input
              type="color"
              value={color}
              onChange={handleColorPickerChange}
              className="mx-2 rounded border border-[#ccc] p-2"
            />

            <input
              type="text"
              value={hexColor}
              onChange={handleHexChange}
              placeholder="#ff0000"
              maxLength={7}
              className="mx-2 rounded border border-[#ccc] px-3 py-2 text-sm"
            />

            <br />

            <label htmlFor="mode" className="mr-2">
              Mode:
            </label>

            <select
              id="mode"
              value={mode}
              onChange={handleModeChange}
              className="mx-2 rounded border border-[#ccc] px-3 py-2 text-sm"
            >
              <option value="all">Recolor Everything</option>
              <option value="nonTransparent">
                Replace Only Non-Transparent Pixels
              </option>
            </select>

            <br />

            <Button onClick={downloadImage} variant={"outline"}>
              Download PNG
            </Button>

            <canvas
              ref={canvasRef}
              className="mt-4 max-w-full rounded-lg border border-[#ddd]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
