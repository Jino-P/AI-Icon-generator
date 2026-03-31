import React, { useEffect, useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import "../styles/gallery.css";
import api from "../services/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ImageService from "../services/ImageServices";

const ImageGallery = () => {
  usePageTitle("Gallery");

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [downloadImageSrc, setDownloadImageSrc] = useState(null);

  useEffect(() => {
    api
      .get("/api/images")
      .then((res) => {
        setImages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
        setLoading(false);
      });
  }, []);

  const groupedImages = images.reduce((groups, image) => {
    const key = image.generation_id || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(image);
    return groups;
  }, {});

 const downloadImage = async (imageSrc, format) => {
  if (!imageSrc) {
    alert("No image available");
    return;
  }

  try {
    await ImageService.downloadImage(imageSrc, format);
    setShowFormatModal(false);
  } catch (err) {
    console.error("Download error:", err);
    alert("Failed to download image");
  }
};
const handleDownload = (ImageSrc) => {
    if (!ImageSrc) {
      alert("No image to download");
      return;
    }
    setDownloadImageSrc(ImageSrc);
    setShowFormatModal(true);
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);
      const zip = new JSZip();

      for (let img of images) {
        const response = await fetch(img.image_url);
        const blob = await response.blob();
        zip.file(`image-${img.id}.png`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "generated-icons.zip");
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className ="page-wrapper">
    <div className="gallery-container">

      <div className="gallery-header">
        <h1>Generated Icons</h1>

        {images.length > 0 && (
          <button
            className="download-all-btn"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
          >
            {downloadingAll ? "Preparing ZIP..." : "Download All"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading icons...</div>
      ) : (
        Object.entries(groupedImages).map(([generationId, group]) => {
          const prompt = group[0]?.prompt || "Untitled";

          return (
            <div key={generationId} className="generation-group">

              <div className="generation-header">
                <h3>{prompt}</h3>
                <span>{group.length} icons</span>
              </div>

              <div className="image-grid">
                {group.map((img) => (
                  <div key={img.id} className="image-card">

                    <img
                      src={img.image_url}
                      alt={img.name}
                      onClick={() => setSelectedImage(img)}
                    />

                    <div className="image-overlay">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          (window.location.href = `/studio?image_id=${img.id}`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="download-btn"
                        onClick={() => handleDownload(img.image_url)}
                      >
                        Download
                      </button>
                    </div>

                    <div className="image-caption">{img.name}</div>

                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedImage.image_url} alt="Preview" />
            <p>{selectedImage.prompt}</p>
          </div>
        </div>
      )}
      {/* Format Modal */}
            {showFormatModal && (
              <div className="format-modal-overlay" onClick={() => setShowFormatModal(false)}>
                <div className="format-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Select Download Format</h3>
                  <div className="format-buttons">
                    <button
                      className="format-btn"
                      onClick={() => downloadImage(downloadImageSrc,"png")}
                    >
                      📋 PNG
                      <span className="format-desc">Lossless (Transparent BG)</span>
                    </button>
                    <button
                      className="format-btn"
                      onClick={() => downloadImage(downloadImageSrc,"jpeg")}
                      title="JPEG format (white background)"
                    >
                      🎨 JPEG
                      <span className="format-desc">Compressed (White BG)</span>
                    </button>
                    <button
                      className="format-btn"
                      onClick={() => downloadImage(downloadImageSrc,"webp")}
                    >
                      🌐 WebP
                      <span className="format-desc">Modern (Compressed)</span>
                    </button>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setShowFormatModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
    </div>
    </div>
  );
};

export default ImageGallery;