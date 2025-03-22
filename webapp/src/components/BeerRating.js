import { Rating } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';

// Custom styled Rating component with half-star support
const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: 'var(--beer-amber)',
    filter: 'drop-shadow(0 0 2px rgba(251, 192, 45, 0.3))',
  },
  '& .MuiRating-iconEmpty': {
    color: 'rgba(255, 255, 255, 0.3)',
    filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.1))',
  },
  '& .MuiRating-iconHover': {
    color: 'var(--copper)',
    filter: 'drop-shadow(0 0 3px rgba(251, 192, 45, 0.5))',
  },
  // Add subtle transition for smooth hover effect
  '& .MuiRating-icon': {
    transition: 'all 0.2s ease-in-out',
    fontSize: '2rem',
  },
  // Scale up slightly on hover for interactive feedback
  '&:hover .MuiRating-icon': {
    transform: 'scale(1.1)',
  },
  // Custom styles for half-star state
  '& .MuiRating-decimal': {
    position: 'relative',
    '& .MuiRating-icon': {
      position: 'absolute',
      left: 0,
      width: '50%',
      overflow: 'hidden',
      '&:hover': {
        transform: 'none',
      },
    },
  },
}));

export default function BeerRating({ value, onChange, readOnly, size = 'large', ...props }) {
  return (
    <StyledRating
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      precision={0.5}
      icon={<StarIcon fontSize="inherit" />}
      emptyIcon={<StarBorderIcon fontSize="inherit" />}
      size={size}
      {...props}
    />
  );
} 