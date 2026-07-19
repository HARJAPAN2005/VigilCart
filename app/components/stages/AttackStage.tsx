'use client';

import AttackEditor from '../AttackEditor';
import { useWorkspace, ATTACK_OFFER, FLAGSHIP_INTENT } from '../../workspace/WorkspaceContext';
import StageHeader from './StageHeader';

export default function AttackStage() {
  const { intent } = useWorkspace();

  return (
    <div className="space-y-6">
      <StageHeader
        eyebrow="Act 4 — Your turn"
        title="The Attack Lab"
        blurb="This merchant review is live evidence. Rewrite it. Hide an instruction in it. Try to talk the agent out of its rules — then watch which agent breaks."
      />
      <AttackEditor intent={intent ?? FLAGSHIP_INTENT} injectedOffer={ATTACK_OFFER} />
    </div>
  );
}
