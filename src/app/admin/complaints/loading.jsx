import { CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full min-h-96">
      <CircularProgress />
    </div>
  );
}
