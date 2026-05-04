// import { useState, useEffect, useCallback } from 'react';
// import { useEventFeed } from '../hooks/useEventFeed';

// const S = {
//   page: { minHeight:'100vh', background:'#0a0a0f', color:'#e2e8f0', fontFamily:'monospace', padding:'24px' },
//   header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
//   title: { fontSize:20, fontWeight:700 },
//   controls: { display:'flex', gap:12, alignItems:'center' },
//   select: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:6, padding:'8px 12px', color:'#e2e8f0', fontFamily:'inherit', fontSize:12 },
//   search: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:6, padding:'8px 12px', color:'#e2e8f0', fontFamily:'inherit', fontSize:12, width:200 },
//   clearBtn: { background:'transparent', border:'1px solid #1e1e2e', borderRadius:6, padding:'8px 12px', color:'#4a5568', cursor:'pointer', fontFamily:'inherit', fontSize:12 },
//   grid: { display:'grid', gridTemplateColumns:'1fr 2fr', gap:16, height:'calc(100vh - 120px)' },
//   eventList: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:10, padding:'16px', overflowY:'auto' },
//   eventItem: { background:'#0f0f15', border:'1px solid #1e1e2e', borderRadius:8, padding:'12px', marginBottom:8, cursor:'pointer', transition:'border-color 0.15s' },
//   eventItemSelected: { borderColor:'#5b6cf4', background:'#10102a' },
//   eventMeta: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
//   eventTopic: { fontSize:12, color:'#68d391', fontWeight:500 },
//   eventTime: { fontSize:10, color:'#4a5568' },
//   eventId: { fontSize:10, color:'#6b7280', fontFamily:'monospace' },
//   eventPayload: { fontSize:11, color:'#a0aec0', background:'#0a0a0f', padding:'8px', borderRadius:4, marginTop:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
//   detailsPanel: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:10, padding:'20px', overflowY:'auto' },
//   detailsTitle: { fontSize:16, fontWeight:700, marginBottom:16 },
//   detailsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 },
//   detailItem: { background:'#0f0f15', border:'1px solid #1e1e2e', borderRadius:8, padding:'12px' },
//   detailLabel: { fontSize:10, color:'#4a5568', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 },
//   detailValue: { fontSize:12, color:'#e2e8f0', fontFamily:'monospace' },
//   payloadViewer: { background:'#0a0a0f', border:'1px solid #1e1e2e', borderRadius:8, padding:'16px', marginTop:16 },
//   payloadTitle: { fontSize:12, color:'#4a5568', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' },
//   payloadContent: { fontSize:11, color:'#a0aec0', fontFamily:'monospace', whiteSpace:'pre-wrap', wordBreak:'break-all', maxHeight:'400px', overflowY:'auto' },
//   emptyState: { textAlign:'center', padding:'40px', color:'#4a5568' },
//   status: { display:'inline-block', padding:'2px 8px', borderRadius:12, fontSize:9, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.5px' },
//   statusDelivered: { background:'#dcfce7', color:'#166534' },
//   statusQueued: { background:'#fef3c7', color:'#92400e' },
//   statusFailed: { background:'#fee2e2', color:'#991b1b' },
// };

// const EventStatus = ({ status }) => {
//   const styles = {
//     delivered: S.statusDelivered,
//     queued: S.statusQueued,
//     failed: S.statusFailed,
//   };
//   return (
//     <span style={{ ...S.status, ...styles[status] }}>
//       {status}
//     </span>
//   );
// };

// export default function EventDetailsViewer({ token }) {
//   const { events, status } = useEventFeed(token);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [filter, setFilter] = useState('all'); // all, delivered, queued, failed
//   const [search, setSearch] = useState('');

//   const filteredEvents = events.filter(event => {
//     if (filter !== 'all' && event.status !== filter) return false;
//     if (search && !event.topic.toLowerCase().includes(search.toLowerCase()) &&
//         !event.id.toLowerCase().includes(search.toLowerCase())) return false;
//     return true;
//   });

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//   };

//   const clearFilters = () => {
//     setFilter('all');
//     setSearch('');
//   };

//   return (
//     <div style={S.page}>
//       <div style={S.header}>
//         <div>
//           <div style={S.title}>Event Details Viewer</div>
//           <div style={{ fontSize:11, color:'#4a5568', marginTop:4 }}>
//             {filteredEvents.length} events • WebSocket: {status}
//           </div>
//         </div>
//         <div style={S.controls}>
//           <select
//             style={S.select}
//             value={filter}
//             onChange={e => setFilter(e.target.value)}
//           >
//             <option value="all">All Events</option>
//             <option value="delivered">Delivered</option>
//             <option value="queued">Queued</option>
//             <option value="failed">Failed</option>
//           </select>
//           <input
//             style={S.search}
//             type="text"
//             placeholder="Search topics/IDs..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//           />
//           {(filter !== 'all' || search) && (
//             <button style={S.clearBtn} onClick={clearFilters}>Clear</button>
//           )}
//         </div>
//       </div>

//       <div style={S.grid}>
//         {/* Event List */}
//         <div style={S.eventList}>
//           {filteredEvents.length === 0 ? (
//             <div style={S.emptyState}>
//               {events.length === 0 ? 'No events received yet' : 'No events match your filters'}
//             </div>
//           ) : (
//             filteredEvents.map((event) => (
//               <div
//                 key={event.id}
//                 style={{
//                   ...S.eventItem,
//                   ...(selectedEvent?.id === event.id ? S.eventItemSelected : {}),
//                 }}
//                 onClick={() => handleEventClick(event)}
//               >
//                 <div style={S.eventMeta}>
//                   <span style={S.eventTopic}>{event.topic}</span>
//                   <EventStatus status={event.status || 'queued'} />
//                 </div>
//                 <div style={S.eventTime}>
//                   {new Date(event.receivedAt || event.timestamp).toLocaleString()}
//                 </div>
//                 <div style={S.eventId}>{event.id}</div>
//                 <div style={S.eventPayload}>
//                   {JSON.stringify(event.payload).substring(0, 100)}...
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Details Panel */}
//         <div style={S.detailsPanel}>
//           {selectedEvent ? (
//             <>
//               <div style={S.detailsTitle}>Event Details</div>

//               <div style={S.detailsGrid}>
//                 <div style={S.detailItem}>
//                   <div style={S.detailLabel}>Event ID</div>
//                   <div style={S.detailValue}>{selectedEvent.id}</div>
//                 </div>
//                 <div style={S.detailItem}>
//                   <div style={S.detailLabel}>Topic</div>
//                   <div style={S.detailValue}>{selectedEvent.topic}</div>
//                 </div>
//                 <div style={S.detailItem}>
//                   <div style={S.detailLabel}>Status</div>
//                   <div style={S.detailValue}>
//                     <EventStatus status={selectedEvent.status || 'queued'} />
//                   </div>
//                 </div>
//                 <div style={S.detailItem}>
//                   <div style={S.detailLabel}>Received At</div>
//                   <div style={S.detailValue}>
//                     {new Date(selectedEvent.receivedAt || selectedEvent.timestamp).toLocaleString()}
//                   </div>
//                 </div>
//                 {selectedEvent.priority && (
//                   <div style={S.detailItem}>
//                     <div style={S.detailLabel}>Priority</div>
//                     <div style={S.detailValue}>{selectedEvent.priority}</div>
//                   </div>
//                 )}
//                 {selectedEvent.producerId && (
//                   <div style={S.detailItem}>
//                     <div style={S.detailLabel}>Producer ID</div>
//                     <div style={S.detailValue}>{selectedEvent.producerId}</div>
//                   </div>
//                 )}
//               </div>

//               <div style={S.payloadViewer}>
//                 <div style={S.payloadTitle}>Payload</div>
//                 <div style={S.payloadContent}>
//                   {JSON.stringify(selectedEvent.payload, null, 2)}
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div style={S.emptyState}>
//               Select an event from the list to view details
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }