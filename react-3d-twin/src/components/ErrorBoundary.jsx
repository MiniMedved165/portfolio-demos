import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[280px] flex items-center justify-center rounded-xl border border-current/15 p-6 text-center font-mono text-xs opacity-75">
          {this.props.fallbackText || "3D-визуализация временно недоступна"}
        </div>
      );
    }
    return this.props.children;
  }
}
