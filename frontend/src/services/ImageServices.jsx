class ImageService {

  // ---------------- REMOVE BACKGROUND ----------------
  static async removeBackground(file, api) {
    if (!file) throw new Error("No file provided");

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/remove-bg", formData, {
      responseType: "blob",
    });

    const blob = res.data;
    const url = URL.createObjectURL(blob);

    const newFile = new File([blob], "bg-removed.png", {
      type: "image/png",
    });

    return {
      url,
      file: newFile,
    };
  }

  // ---------------- DOWNLOAD IMAGE ----------------
 static async downloadImage(imageSrc, format) {
  if (!imageSrc) throw new Error("No image to download");

  // Fetch image as blob first
  const response = await fetch(imageSrc);
  console.log("Fetched image for download:", response);
  const blob = await response.blob();

  // If PNG, download directly
  if (format === "png") {
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `icon-${Date.now()}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
    return;
  }

  // Convert to other formats
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (format === "jpeg") {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (newBlob) => {
          const blobUrl = URL.createObjectURL(newBlob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `icon-${Date.now()}.${format}`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(blobUrl);
          resolve();
        },
        `image/${format === "jpg" ? "jpeg" : format}`,
        format === "jpeg" ? 0.95 : 1
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}
}

export default ImageService;