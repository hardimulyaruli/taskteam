import React, { Component } from 'react';
import { FiClock, FiAward } from 'react-icons/fi';

// Class Component to satisfy the requirement
class DeadlineTerdekat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false
    };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  render() {
    return (
      <div className={`bg-[#1E293B] rounded-2xl p-6 border border-slate-700/50 flex flex-col transition-all duration-500 ${this.state.isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-2 mb-6 text-slate-200 font-semibold">
          <FiClock className="text-red-400 w-5 h-5" /> Deadline Terdekat
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <FiAward className="w-12 h-12 mb-4 text-yellow-500" />
          <p>Semua tugas selesai!</p>
        </div>
      </div>
    );
  }
}

export default DeadlineTerdekat;
