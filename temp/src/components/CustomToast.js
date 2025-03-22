import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton } from '@mui/material';
import { 
  Close as CloseIcon, 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  LocalBar as BeerIcon,
} from '@mui/icons-material';

const ToastContainer = styled(Box)(({ type }) => ({
  background: 'var(--glass-background)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--glass-border)',
  borderLeft: `4px solid ${
    type === 'success' ? '#4caf50' :
    type === 'error' ? '#f44336' :
    type === 'warning' ? '#ff9800' :
    type === 'beer' ? 'var(--beer-amber)' :
    '#2196f3'
  }`,
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: '300px',
  maxWidth: '400px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  animation: 'slideIn 0.3s ease-out',
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    },
  },
}));

const IconWrapper = styled(Box)(({ type }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: `${
    type === 'success' ? 'rgba(76, 175, 80, 0.1)' :
    type === 'error' ? 'rgba(244, 67, 54, 0.1)' :
    type === 'warning' ? 'rgba(255, 152, 0, 0.1)' :
    type === 'beer' ? 'rgba(251, 192, 45, 0.1)' :
    'rgba(33, 150, 243, 0.1)'
  }`,
  '& svg': {
    color: `${
      type === 'success' ? '#4caf50' :
      type === 'error' ? '#f44336' :
      type === 'warning' ? '#ff9800' :
      type === 'beer' ? 'var(--beer-amber)' :
      '#2196f3'
    }`,
  },
}));

const ToastIcon = ({ type }) => {
  const icons = {
    success: <CheckCircleIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
    beer: <BeerIcon />,
  };
  return (
    <IconWrapper type={type}>
      {icons[type] || icons.info}
    </IconWrapper>
  );
};

const MessageWrapper = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export default function CustomToast({ 
  title,
  message, 
  type = 'info', 
  onClose 
}) {
  return (
    <ToastContainer type={type}>
      <ToastIcon type={type} />
      <MessageWrapper>
        {title && (
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: type === 'beer' ? 'var(--beer-amber)' : 'inherit'
            }}
          >
            {title}
          </Typography>
        )}
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {message}
        </Typography>
      </MessageWrapper>
      {onClose && (
        <IconButton 
          size="small" 
          onClick={onClose}
          sx={{ 
            color: 'var(--text-secondary)',
            '&:hover': { 
              color: 'var(--text-primary)',
              background: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </ToastContainer>
  );
} 