import InboxRounded from "@mui/icons-material/InboxRounded";

const EmptyState = ({
  icon: Icon = InboxRounded,
  title = "No records found",
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full">
      <Icon sx={{ fontSize: 40 }} className="text-secondary" />
      <p className="text-sm font-semibold text-text">{title}</p>
      {description && (
        <p className="text-xs text-text/60 max-w-xs text-center">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
