import { useNavigate } from 'react-router-dom';
import { normaliseCompoundId } from '@/integrations/knowledge/client';

interface CompoundLinkProps {
  name?: string | null;
  className?: string;
}

/** Tappable compound name that navigates to /compound/:compoundId */
const CompoundLink = ({ name, className = '' }: CompoundLinkProps) => {
  const navigate = useNavigate();
  const compoundId = normaliseCompoundId(name);
  const label = typeof name === 'string' && name.trim() ? name : 'Unknown compound';
  const isDisabled = !compoundId;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (isDisabled) return;
        navigate(`/compound/${compoundId}`);
      }}
      disabled={isDisabled}
      className={`text-primary transition-colors text-left ${isDisabled ? 'cursor-default opacity-70' : 'cursor-pointer hover:underline'} ${className}`}
    >
      {label}
    </button>
  );
};

export default CompoundLink;
