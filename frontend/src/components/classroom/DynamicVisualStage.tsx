import React, { useState } from 'react';
import { EquationRenderer } from '../visualizer/EquationRenderer';
import { GraphRenderer } from '../visualizer/GraphRenderer';
import { FlowDiagram } from '../visualizer/FlowDiagram';
import { Timeline } from '../visualizer/Timeline';
import { CodeVisualizer } from '../visualizer/CodeVisualizer';
import { ConceptMap } from '../visualizer/ConceptMap';
import { ProcessDiagram } from '../visualizer/ProcessDiagram';
import { ConceptCardVisualizer } from '../visualizer/ConceptCardVisualizer';
import { ComparisonTable } from '../visualizer/ComparisonTable';
import { HolographicTopicVisualizer } from '../visualizer/HolographicTopicVisualizer';
import { Eye, Layers, Sparkles } from 'lucide-react';

interface DynamicVisualStageProps {
  visual?: {
    type: string;
    title?: string;
    description?: string;
    data: any;
    emphasis?: string[];
  };
  currentSegmentTitle?: string;
  topic?: string;
  isSpeaking?: boolean;
}

export const DynamicVisualStage: React.FC<DynamicVisualStageProps> = ({
  visual,
  currentSegmentTitle,
  topic = '',
  isSpeaking = true,
}) => {
  const [viewMode, setViewMode] = useState<'hologram' | 'structured'>('hologram');
  const vtype = (visual?.type || 'diagram').toLowerCase();
  const vdata = visual?.data || {};

  const renderComponent = () => {
    if (viewMode === 'hologram') {
      return (
        <HolographicTopicVisualizer
          topic={topic}
          segmentTitle={currentSegmentTitle || visual?.title}
          visualData={visual}
          isSpeaking={isSpeaking}
        />
      );
    }

    switch (vtype) {
      case 'equation':
      case 'formula':
        return <EquationRenderer data={vdata} />;
      case 'graph':
      case 'chart':
        return <GraphRenderer data={vdata} />;
      case 'flow':
      case 'diagram':
        return <FlowDiagram data={vdata} />;
      case 'timeline':
      case 'history':
        return <Timeline data={vdata} />;
      case 'code':
      case 'algorithm':
        return <CodeVisualizer data={vdata} />;
      case 'concept_map':
      case 'map':
        return <ConceptMap data={vdata} />;
      case 'process':
        return <ProcessDiagram data={vdata} />;
      case 'concept_card':
      case 'card':
        return <ConceptCardVisualizer data={vdata} />;
      case 'table':
      case 'comparison':
        return <ComparisonTable data={vdata} />;
      default:
        if (vdata.latex || vdata.equation) {
          return <EquationRenderer data={vdata} />;
        } else if (vdata.series) {
          return <GraphRenderer data={vdata} />;
        } else if (vdata.events) {
          return <Timeline data={vdata} />;
        } else if (vdata.nodes) {
          return <ConceptMap data={vdata} />;
        } else if (vdata.steps) {
          return <ProcessDiagram data={vdata} />;
        } else if (vdata.headers && vdata.rows) {
          return <ComparisonTable data={vdata} />;
        }
        return <ConceptCardVisualizer data={vdata} />;
    }
  };

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Visual Subtitle & View Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">
            {visual?.title || currentSegmentTitle || `${topic} Visual Aid`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'hologram' ? 'structured' : 'hologram')}
            className="flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{viewMode === 'hologram' ? '📊 Detailed Chart' : '🧬 Sci-Fi Hologram'}</span>
          </button>
          <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30 uppercase tracking-wider">
            {viewMode === 'hologram' ? 'Holographic' : vtype}
          </span>
        </div>
      </div>

      {/* Main Render Area */}
      <div className="flex-1 min-h-[340px]">
        {renderComponent()}
      </div>

      {/* Visual Description Footer */}
      {visual?.description && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex items-start space-x-2 shadow-sm">
          <Eye className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">{visual.description}</p>
        </div>
      )}
    </div>
  );
};

