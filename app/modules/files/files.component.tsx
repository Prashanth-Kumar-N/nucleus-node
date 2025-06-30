import { CloudUploadOutlined } from "@mui/icons-material";
import { Input, Button } from "@mui/joy";
import axios from "axios";
import type { ChangeEvent } from "react";

const Files = () => {
  const fileSelected = async (e: ChangeEvent) => {
    console.log((e.target as HTMLInputElement).files);
    const files = (e.target as HTMLInputElement)?.files;
    const formData = new FormData();

    if (files) {
      Array.from(files).forEach((file) => formData.append("file", file));

      try {
        const response = await axios.post(
          "http://localhost:3001/upload-file",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("File uploaded successfully:", response.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <section className="flex flex-col">
      <Button
        component="label"
        role={undefined}
        tabIndex={-1}
        variant="outlined"
        color="neutral"
        className="w-24"
        startDecorator={<CloudUploadOutlined />}
      >
        <span>Upload</span>
        <input type="file" hidden multiple onChange={(e) => fileSelected(e)} />
      </Button>
    </section>
  );
};
export default Files;
