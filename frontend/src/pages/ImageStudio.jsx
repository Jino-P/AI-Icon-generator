import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import api from "../services/api";
import {
  FaUpload,
  FaEraser,
  FaPalette,
  FaUndo,
  FaRedo,
  FaSave,
  FaDownload,
  FaArrowLeft,
  FaBrush,
} from "react-icons/fa";
import "../styles/image_studio.css";

export default function ImageStudio() {
  usePageTitle("Image Studio");
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState(null);
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [loading, setLoading] = useState(false); // loading for gallery image or backend requests
  const [generating, setGenerating] = useState(false); // AI prompt processing
  const [saving, setSaving] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [CreditsUsed, setCreditsUsed] = useState(0);

  // Load image from gallery if provided
  useEffect(() => {
    const imageId = searchParams.get("image_id");
    if (imageId) {
      loadImageFromGallery(imageId);
    }
  }, [searchParams]);

  // const loadImageFromGallery = async (id) => {
  //   try {
  //     setLoading(true)
  //     const res = await api.get(`api/image/${id}`, {
  //       responseType: "blob",
  //     });

  //     const blob = res.data;
  //     const url = URL.createObjectURL(blob);
  //     setImageSrc(url);
  //     setFile(new File([blob], "gallery.png", { type: "image/png" }));
  //   } catch (err) {
  //     console.error("Error loading image:", err);
  //     alert("Failed to load image from gallery");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const loadImageFromGallery = async (id) => {
  try {
    setLoading(true);

    const res = await api.get(`api/image/${id}`); // ❌ remove blob

    const imageUrl = res.data.image_url;

    setImageSrc(imageUrl);

    // optional: if you still need File object
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    setFile(new File([blob], "gallery.png", { type: blob.type }));

  } catch (err) {
    console.error("Error loading image:", err);
    alert("Failed to load image from gallery");
  } finally {
    setLoading(false);
  }
};

  const handleUpload = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(selected);
  };

  // ---------------- APPLY PROMPT ----------------
  const handleApplyPrompt = async () => {
    if (!prompt) return alert("Please enter a prompt first");
    if (!file) return alert("Please upload or select an image first");

    try {
      setGenerating(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);

      // backend should return edited image blob
      const res = await api.post("/api/edit-with-prompt", formData, {
        responseType: "blob",
      });
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      setCreditsUsed(prev => prev + Number(res.headers["x-credits-used"] || 0));
      setImageSrc(url);
      setFile(new File([blob], "edited.png", { type: "image/png" }));
    } catch (err) {
      console.error("Prompt apply error:", err);
      alert("Failed to apply prompt to image");
    } finally {
      setGenerating(false);
    }
  };

  // ---------------- REMOVE BACKGROUND ----------------
  const handleRemoveBackground = async () => {
    if (!file) return alert("Upload or select an image first");

    try {
      setRemovingBg(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("api/remove-bg", formData, {
        responseType: "blob",
      });

      const blob = res.data;
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
      setFile(new File([blob], "bg-removed.png", { type: "image/png" }));
    } catch (err) {
      console.error("Remove BG error:", err);
      alert("Failed to remove background");
    } finally {
      setRemovingBg(false);
    }
  };

  // ---------------- DOWNLOAD WITH FORMAT SELECTION ----------------
  const downloadImage = async (format) => {
    if (!imageSrc) return alert("No image to download");

    try {
      // For PNG, download file blob directly to preserve transparency
      if (format === "png" && file) {
        const blobUrl = window.URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `icon-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        setShowFormatModal(false);
        return;
      }

      // For JPEG and other formats, use canvas to add white background
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Add white background for JPEG
        if (format === "jpeg") {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `icon-${Date.now()}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            setShowFormatModal(false);
          },
          `image/${format === "jpg" ? "jpeg" : format}`,
          format === "jpeg" ? 0.95 : 1
        );
      };

      img.onerror = () => alert("Failed to load image for download");
      img.src = imageSrc;
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image");
    }
  };

  const handleDownload = () => {
    if (!imageSrc) {
      alert("No image to download");
      return;
    }
    setShowFormatModal(true);
  };

  const handleSave = async () => {
    if (!file) {
      alert("No image to save");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt || "Edited from studio");

      const res = await api.post("/api/save-edited", formData);
      alert("Image saved successfully!");
      setPrompt("");
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
  };

  const getImageStyle = () => {
    const brightnessValue = 1 + brightness / 100;
    const contrastValue = 1 + contrast / 100;
    const saturationValue = 1 + saturation / 100;

    return {
      filter: `brightness(${brightnessValue}) contrast(${contrastValue}) saturate(${saturationValue})`,
    };
  };

  return (
    <div className = "page-wrapper">
    <div className="studio-container">
      {/* Left Panel - Controls */}
      <div className="studio-sidebar">
        <div className="studio-header">
          <button
            className="back-btn"
            onClick={() => navigate("/gallery")}
            title="Back to Gallery"
          >
            <FaArrowLeft /> Back
          </button>
          <h2>Image Studio</h2>
        </div>

        {(loading || generating || removingBg) ? (
          <div className="loading-spinner">
            {removingBg
              ? "Removing background..."
              : generating
              ? "Applying prompt..."
              : "Loading image..."}
          </div>
        ) : (
          <>
            {/* Upload Section */}
            <div className="section">
              <h3>Upload Image</h3>
              <label className="upload-btn">
                <FaUpload /> Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  hidden
                />
              </label>
              {file && (
                <p className="file-name">📄 {file.name}</p>
              )}
            </div>

            {/* Prompt Section */}
            <div className="section">
              <h3>Prompt</h3>
              <textarea
                className="prompt-input"
                placeholder="Enter prompt for this image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows="3"
              />
              <button
                className="action-btn apply"
                onClick={handleApplyPrompt}
                disabled={generating || !prompt || !file}
              >
                <FaPalette /> {generating ? "Generating..." : "Apply Prompt"}
              </button>
            </div>

            {/* Background Removal Section */}
            {imageSrc && (
              <div className="section">
                <h3>Enhancement</h3>
                <button
                  className="action-btn remove-bg"
                  onClick={handleRemoveBackground}
                  disabled={removingBg}
                >
                  <FaEraser /> {removingBg ? "Removing..." : "Remove Background"}
                </button>
              </div>
            )}

            {/* Filters Section */}
            {imageSrc && (
              <>
                <div className="section">
                  <h3>Adjustments</h3>

                  <div className="slider-group">
                    <label>
                      <FaBrush /> Brightness
                      <span className="value">{brightness}</span>
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="slider"
                    />
                  </div>

                  <div className="slider-group">
                    <label>
                      Contrast
                      <span className="value">{contrast}</span>
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="slider"
                    />
                  </div>

                  <div className="slider-group">
                    <label>
                      Saturation
                      <span className="value">{saturation}</span>
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="slider"
                    />
                  </div>

                  <button className="reset-btn" onClick={resetFilters}>
                    <FaUndo /> Reset Filters
                  </button>
                </div>
              </>
            )}

            {/* Action Buttons */}
            {imageSrc && (
              <div className="section action-section">
                <h3>Actions</h3>
                <button
                  className="action-btn download"
                  onClick={handleDownload}
                  disabled={generating || removingBg}
                >
                  <FaDownload /> Download
                </button>
                <button
                  className="action-btn save"
                  onClick={handleSave}
                  disabled={saving || generating || removingBg}
                >
                  <FaSave /> {saving ? "Saving..." : "Save"}
                </button>
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
                      onClick={() => downloadImage("png")}
                    >
                      📋 PNG
                      <span className="format-desc">Lossless (Transparent BG)</span>
                    </button>
                    <button
                      className="format-btn"
                      onClick={() => downloadImage("jpeg")}
                      title="JPEG format (white background)"
                    >
                      🎨 JPEG
                      <span className="format-desc">Compressed (White BG)</span>
                    </button>
                    <button
                      className="format-btn"
                      onClick={() => downloadImage("webp")}
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
          </>
        )}
      </div>

      {/* Right Panel - Image Display */}
      
      <div className="studio-preview">
            <div className="image-header">
              <label className="usage-label">
                <b>credits used: </b>{CreditsUsed}<br />
              </label>
            </div>
        {imageSrc ? (
          
          <div className="image-wrapper">
            <img
              src={imageSrc}
              alt="Preview"
              className="preview-image"
              style={getImageStyle()}
            />
</div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
            <h2>No Image Yet</h2>
            <p>Upload an image from your device or select one from the gallery</p>
          </div></div>
        )}
      </div>
    </div>
    </div>
  );
}
