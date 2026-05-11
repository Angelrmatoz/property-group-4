import { transformCloudinaryUrl } from "@/lib/utils";

describe("utils", () => {
  describe("transformCloudinaryUrl", () => {
    it("returns placeholder for null/undefined", () => {
      expect(transformCloudinaryUrl("")).toBe("/placeholder.svg");
      expect(transformCloudinaryUrl(null as any)).toBe("/placeholder.svg");
      expect(transformCloudinaryUrl(undefined as any)).toBe("/placeholder.svg");
    });

    it("returns non-Cloudinary URLs unchanged", () => {
      const url = "https://example.com/image.jpg";
      expect(transformCloudinaryUrl(url)).toBe(url);
    });

    it("returns plain /placeholder.svg unchanged", () => {
      expect(transformCloudinaryUrl("/placeholder.svg")).toBe("/placeholder.svg");
    });

    it("takes first URL when comma-separated", () => {
      const multi = "https://res.cloudinary.com/demo/image1.jpg,https://res.cloudinary.com/demo/image2.jpg";
      const result = transformCloudinaryUrl(multi);
      expect(result).not.toContain(",");
      expect(result).toContain("image1.jpg");
    });

    it("injects f_auto,q_auto into Cloudinary URLs", () => {
      const url = "https://res.cloudinary.com/my-cloud/image/upload/v123/folder/img.jpg";
      const result = transformCloudinaryUrl(url);
      expect(result).toContain("/upload/f_auto,q_auto/");
    });

    it("does not double-transform URLs that already have f_", () => {
      const url = "https://res.cloudinary.com/my-cloud/image/upload/f_auto,q_auto/v123/img.jpg";
      const result = transformCloudinaryUrl(url);
      expect(result).toBe(url);
    });

    it("does not double-transform URLs that already have q_", () => {
      const url = "https://res.cloudinary.com/my-cloud/image/upload/q_auto/v123/img.jpg";
      const result = transformCloudinaryUrl(url);
      expect(result).toBe(url);
    });

    it("handles Cloudinary HEIC images", () => {
      const url = "https://res.cloudinary.com/my-cloud/image/upload/v123/properties/photo.heic";
      const result = transformCloudinaryUrl(url);
      expect(result).toContain("/upload/f_auto,q_auto/");
      expect(result).toContain("photo.heic");
    });
  });
});
