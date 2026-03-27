import { useNavigate } from 'react-router-dom';
import { normaliseCompoundId } from '@/integrations/knowledge/client';

interface CompoundLinkProps {
  name: string;
  className?: string;
}

/** Tappable compound name that navigates to /compound/:compoundId */
const CompoundLink = ({ name, className = '' }: CompoundLinkProps) => {
  const navigate = useNavigate();
  const compoundId = normaliseCompoundId(name);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/compound/${compoundId}`);
      }}
      className={`text-primary hover:underline cursor-pointer transition-colors text-left ${className}`}
    >
      {name}
    </button>
  );
};

export default CompoundLink;
