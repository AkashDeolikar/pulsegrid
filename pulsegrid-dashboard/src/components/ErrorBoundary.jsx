import { Component } from 'react';

/**
 * ErrorBoundary
 * Catches any render errors in child components.
 * Prevents the whole app from crashing on a single page error.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.icon}>⚠</div>
          <div style={S.title}>Something went wrong</div>
          <div style={S.sub}>
            {this.props.label || 'This page'} encountered an unexpected error.
          </div>
          {this.state.error && (
            <pre style={S.errorMsg}>
              {this.state.error.message}
            </pre>
          )}
          <div style={S.actions}>
            <button style={S.resetBtn} onClick={this.handleReset}>
              Try again
            </button>
            <button
              style={S.reloadBtn}
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const S = {
  page: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    background:     '#08080f',
    fontFamily:     '"JetBrains Mono","Fira Code",monospace',
    padding:        '20px',
  },
  card: {
    background:     '#0d0d1a',
    border:         '1px solid #2a1010',
    borderRadius:   '10px',
    padding:        '32px',
    maxWidth:       '420px',
    width:          '100%',
    textAlign:      'center',
  },
  icon:    { fontSize:'28px', marginBottom:'12px' },
  title:   { fontSize:'14px', fontWeight:'600', color:'#e8e6f0', marginBottom:'8px', letterSpacing:'0.04em' },
  sub:     { fontSize:'11px', color:'#5a5a7a', marginBottom:'16px', letterSpacing:'0.04em', lineHeight:'1.6' },
  errorMsg:{
    background:     '#080810',
    border:         '1px solid #14142a',
    borderRadius:   '5px',
    padding:        '10px 12px',
    color:          '#ef4444',
    fontSize:       '10px',
    textAlign:      'left',
    marginBottom:   '18px',
    overflowX:      'auto',
    lineHeight:     '1.5',
    fontFamily:     'monospace',
  },
  actions: { display:'flex', gap:'8px', justifyContent:'center' },
  resetBtn: {
    background:     '#5b6cf4',
    border:         'none',
    borderRadius:   '6px',
    padding:        '9px 18px',
    color:          '#fff',
    fontSize:       '11px',
    cursor:         'pointer',
    fontFamily:     'inherit',
    letterSpacing:  '0.04em',
  },
  reloadBtn: {
    background:     '#0d0d1a',
    border:         '1px solid #14142a',
    borderRadius:   '6px',
    padding:        '9px 18px',
    color:          '#3a3a5c',
    fontSize:       '11px',
    cursor:         'pointer',
    fontFamily:     'inherit',
    letterSpacing:  '0.04em',
  },
};