function PlanAnnotator({ annotations }) {
    if (!annotations || annotations.length === 0) {
        return null;
    }

    return (
        <svg className="plan-annotations" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {annotations.map((annotation, idx) => {
                switch (annotation.type) {
                    case 'box':
                        return (
                            <g key={idx}>
                                <rect
                                    x={annotation.x}
                                    y={annotation.y}
                                    width={annotation.width}
                                    height={annotation.height}
                                    fill="none"
                                    stroke={annotation.color || '#ff0000'}
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />
                                {annotation.label && (
                                    <text
                                        x={annotation.x + 5}
                                        y={annotation.y - 5}
                                        fill={annotation.color || '#ff0000'}
                                        fontSize="12"
                                        fontWeight="bold"
                                    >
                                        {annotation.label}
                                    </text>
                                )}
                            </g>
                        );

                    case 'point':
                        return (
                            <g key={idx}>
                                <circle
                                    cx={annotation.x}
                                    cy={annotation.y}
                                    r="8"
                                    fill={annotation.color || '#ff0000'}
                                    opacity="0.7"
                                />
                                {annotation.label && (
                                    <text
                                        x={annotation.x + 15}
                                        y={annotation.y + 5}
                                        fill={annotation.color || '#ff0000'}
                                        fontSize="12"
                                        fontWeight="bold"
                                    >
                                        {annotation.label}
                                    </text>
                                )}
                            </g>
                        );

                    case 'line':
                        return (
                            <line
                                key={idx}
                                x1={annotation.x1}
                                y1={annotation.y1}
                                x2={annotation.x2}
                                y2={annotation.y2}
                                stroke={annotation.color || '#ff0000'}
                                strokeWidth="3"
                            />
                        );

                    default:
                        return null;
                }
            })}
        </svg>
    );
}
