import { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import api from "../services/api";
import "../styles/SmartIconGenerator.css";
import ImageService from "../services/ImageServices"; "../components/ImageServices"
import JSZip from "jszip";
import { saveAs } from "file-saver";

function SmartIconGenerator() {
  usePageTitle("Generate Icons");
  
  const [form, setForm] = useState({
    app_name: "",
    description: "",
    colours: "",
    platform: "generic",
    style: "",
    keywords: "",
    mood: "",
    website_url: "",
    color_palette: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [downloadImageSrc, setDownloadImageSrc] = useState(null);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [showCreditsUsed, setShowCreditsUsed] = useState(false);


  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Generate icons
  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/generate-icons", form);
      setImages(res.data.images);
      if (res.data["credits_used"]) {
        setCreditsUsed(res.data["credits_used"]);
        // setShowCreditsUsed(true);
      }
    } catch (e) {
      alert("Failed to generate icons");
    } finally {
      setLoading(false);
    }
  };

  // Preview single image
  const handlePreview = (img) => {
    setPreviewImage(`http://127.0.0.1:8000/images/${img}.png`);
  };
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
  // Download all images as ZIP
  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);
      const zip = new JSZip();

      for (let img of images) {
        const response = await fetch(
          `http://127.0.0.1:8000/images/${img}.png`
        );
        const blob = await response.blob();
        zip.file(`${img}.png`, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "app-icons.zip");
    } catch (error) {
      alert("Failed to download images");
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content-container">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="panel-header">
            <h2>AI Icon Generator</h2>
            <p>Create beautiful app icons with AI</p>
          </div>

          {/* ICON IDEA SECTION */}
          <div className="form-section">
            <h3 className="section-title">Icon Idea</h3>
            <div className="form-group full">
              <label>What should your icon represent?</label>
              <input
                type="text"
                placeholder="Describe the core concept your app or icon represents..."
                name="app_name"
                value={form.app_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full">
              <label>Description</label>
              <textarea
                rows="3"
                placeholder="Additional context about your app or icon concept..."
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* VISUAL PREFERENCES SECTION */}
          <div className="form-section">
            <h3 className="section-title">Visual Preferences</h3>
            <div className="form-group">
              <label>Colours (optional)</label>
              <input
                type="text"
                placeholder="e.g., #FF5733, #0A2540"
                name="colours"
                value={form.colours}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Style</label>
              <input
                type="text"
                placeholder="e.g., minimal, flat, 3D, modern"
                name="style"
                value={form.style}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Keywords (optional)</label>
              <input
                type="text"
                placeholder="e.g., simple, professional, playful"
                name="keywords"
                value={form.keywords}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full">
              <label>Mood (optional)</label>
              <input
                type="text"
                placeholder="e.g., energetic, calm, trustworthy"
                name="mood"
                value={form.mood}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* BRAND CONTEXT SECTION */}
          <div className="form-section">
            <h3 className="section-title">Brand Context <span className="optional-label">(optional)</span></h3>
            
            <div className="form-group full">
              <label>Website URL</label>
              <input
                type="url"
                placeholder="e.g., https://stripe.com"
                name="website_url"
                value={form.website_url}
                onChange={handleChange}
              />
              <small>Provide a website to inspire the visual style</small>
            </div>

            <div className="form-group full">
              <label>Brand Color Palette</label>
              <input
                type="text"
                placeholder="e.g., #635BFF, #0A2540, #FFFFFF"
                name="color_palette"
                value={form.color_palette}
                onChange={handleChange}
              />
              <small>Comma-separated hex values</small>
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate Icons"}
          </button>
        </div>

        {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="right-panel-header">
          <h4>Generated Icons</h4>
          {/* <label className="usage-label">
            <b>Recent Usage</b><br/>
            Tokens used: {creditsUsed.tokens_input + creditsUsed.tokens_output} | Images: {creditsUsed.images_generated} | Total: ${creditsUsed.credits_used}
            
            </label> */}
            <label className="usage-label">
                <b>Recent Usage</b><br />

                {creditsUsed ? (
                    <>
                    Tokens used: {(creditsUsed.tokens_input ?? 0) + (creditsUsed.tokens_output ?? 0)} | 
                    Images: {creditsUsed.images_generated ?? 0} | 
                    Total: ${creditsUsed.credits_used ?? 0}
                    </>
                ) : (
                    "No usage yet"
                )}
            </label>
        </div>
          {images.length > 0 && (
            <button
              className="download-all-btn"
              onClick={handleDownloadAll}
              disabled={downloadingAll}
            >
              {downloadingAll ? "Preparing ZIP…" : "Download All"}
            </button>
          )}

          {images.length === 0 ? (
            <div className="empty-state">
              No icons generated yet
            </div>
          ) : (
            <div className="icon-grid">
              {images.map((img) => (
                <div key={img.id} className="icon-card">
                  <img
                    src={img.image_url}
                    alt={img.name}
                  />

                  <div className="icon-overlay">
                    <button onClick={() => window.location.href = `/studio?image_id=${img.id}`}>
                      Edit
                    </button>
                    <button onClick={() => handleDownload(img.image_url)}>
                      Download
                    </button>
                  </div>

                  <span>{img.name}</span>
                </div>
              ))}
            </div>
                      )}


        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="preview-modal"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="preview-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} alt="Preview" />
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
  );
}

export default SmartIconGenerator;