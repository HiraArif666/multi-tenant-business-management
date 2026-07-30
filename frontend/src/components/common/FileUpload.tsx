import { useState } from "react";
import {
  Upload,
  Avatar,
  Button,
  Space,
  message,
  Typography,
} from "antd";
import type { UploadProps } from "antd";

import {
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { uploadFile, getFileUrl } from "../../services/file";

const { Link } = Typography;

const DEFAULT_ACCEPT: Record<"image" | "file", string> = {
  image: "image/png,image/jpeg,image/webp,image/gif",
  file: ".pdf,.doc,.docx,.xls,.xlsx",
};

const MAX_SIZE_MB = 15;

interface FileUploadProps {
  // "image" renders an avatar preview (profile pictures, logos).
  // "file" renders a button + a link to whatever's been uploaded (documents).
  type?: "image" | "file";

  // Controlled value — the stored URL, same value you'd save on the entity
  // (e.g. user.profilePicture, company.logo).
  value?: string | null;

  onChange?: (url: string | null) => void;

  label?: string;
  accept?: string;
  avatarSize?: number;
  disabled?: boolean;
}

export default function FileUpload({
  type = "image",
  value,
  onChange,
  label,
  accept,
  avatarSize = 64,
  disabled,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  // Only known for files uploaded THIS session — on load, an existing
  // value is just a URL, so we fall back to a generic label for it.
  const [fileName, setFileName] = useState<string | null>(
    null,
  );

  const beforeUpload: UploadProps["beforeUpload"] = async (
    file,
  ) => {
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error(
        `File must be smaller than ${MAX_SIZE_MB}MB`,
      );
      return false;
    }

    setUploading(true);

    try {
      const result = await uploadFile(file);

      setFileName(result.originalName);
      onChange?.(result.url);

      message.success("File uploaded");
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ??
          "Upload failed",
      );
    } finally {
      setUploading(false);
    }

    // We already handled the upload ourselves above — stop antd's
    // Upload from also firing its own request.
    return false;
  };

  const handleRemove = () => {
    setFileName(null);
    onChange?.(null);
  };

  if (type === "image") {
    return (
      <Space align="center">
        <Avatar
          size={avatarSize}
          icon={<UserOutlined />}
          src={getFileUrl(value)}
        />

        <Upload
          showUploadList={false}
          beforeUpload={beforeUpload}
          accept={accept ?? DEFAULT_ACCEPT.image}
          disabled={disabled}
        >
          <Button
            icon={<UploadOutlined />}
            loading={uploading}
            disabled={disabled}
          >
            {label ?? "Upload Image"}
          </Button>
        </Upload>
      </Space>
    );
  }

  return (
    <Space direction="vertical">
      <Upload
        showUploadList={false}
        beforeUpload={beforeUpload}
        accept={accept ?? DEFAULT_ACCEPT.file}
        disabled={disabled}
      >
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          disabled={disabled}
        >
          {label ?? "Upload File"}
        </Button>
      </Upload>

      {value && (
        <Space>
          <FileTextOutlined />

          <Link
            href={getFileUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {fileName ?? "View uploaded file"}
          </Link>

          {!disabled && (
            <CloseCircleOutlined
              onClick={handleRemove}
              style={{
                color: "#999",
                cursor: "pointer",
              }}
            />
          )}
        </Space>
      )}
    </Space>
  );
}