// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Calendar, Clock, Brain, Target, Loader, Download, RefreshCw, AlertCircle } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '../api/axios';
// import StudyTimeline from "./StudyTimeline";


// export default function StudyPlan({ workspaceId, workspaceName, deadline }) {
//   const [plan, setPlan] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [daysLeft, setDaysLeft] = useState(0);
//   const [planData, setPlanData] = useState(null);

//   useEffect(() => {
//     if (deadline) {
//       const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
//       setDaysLeft(days);
//     }
//   }, [deadline]);


//   const generatePlan = async (regenerate=false) => {
//     setLoading(true);
//     try {
//       const url = regenerate
//         ? `/workspaces/${workspaceId}/study-plan?regenerate=true`
//         : `/workspaces/${workspaceId}/study-plan`;

//       const response = await api.get(url);
//       setPlan(response.data.plan);
//       setPlanData(response.data);
//       if(response.data.cached){
//         toast.success('Study plan loaded!');
//       }else{
//         toast.success('New study plan generated!')
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.error || 'Failed to generate plan';
//       toast.error(errorMsg);
//       console.error('Error generating plan:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     generatePlan(false);
//   }, []);

//   const downloadPlan = () => {
//     if (!plan) return;
    
//     const blob = new Blob([plan], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${workspaceName}-study-plan.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('Plan downloaded! 📥');
//   };

//   return (
//     <div className="space-y-6">
//       {/* Deadline Banner */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className={`rounded-3xl p-8 shadow-2xl text-white ${
//           daysLeft < 7 
//             ? 'bg-gradient-to-r from-red-500 to-pink-600' 
//             : daysLeft < 14
//             ? 'bg-gradient-to-r from-orange-500 to-red-500'
//             : 'bg-gradient-to-r from-green-500 to-teal-600'
//         }`}
//       >
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-black mb-2">Your Deadline 🎯</h2>
//             <p className="text-xl font-semibold">
//               {deadline ? new Date(deadline).toLocaleDateString('en-US', { 
//                 weekday: 'long', 
//                 year: 'numeric', 
//                 month: 'long', 
//                 day: 'numeric' 
//               }) : 'Not set'}
//             </p>
//           </div>
//           <div className="text-center bg-white bg-opacity-20 backdrop-blur rounded-2xl p-6 border-2 border-white border-opacity-30">
//             <Calendar size={48} className="mx-auto mb-2" />
//             <p className="text-5xl font-black">{daysLeft}</p>
//             <p className="font-bold text-sm">Days Left</p>
//           </div>
//         </div>

//         {daysLeft < 7 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="mt-4 bg-white bg-opacity-20 backdrop-blur rounded-xl p-4"
//           >
//             <p className="flex items-center gap-2 font-semibold">
//               <AlertCircle size={20} />
//               ⚠️ Less than a week left! Time to focus and prioritize!
//             </p>
//           </motion.div>
//         )}
//       </motion.div>

//       {/* Generate Button */}
//       {!plan && (
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => generatePlan(true)}
//           disabled={loading || !deadline}
//           className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? (
//             <span className="flex items-center justify-center gap-3">
//               <Loader className="animate-spin" size={24} />
//               Crafting your perfect study plan...
//             </span>
//           ) : (
//             <span className="flex items-center justify-center gap-3">
//               <Brain size={24} />
//               Generate AI Study Plan
//             </span>
//           )}
//         </motion.button>
//       )}

//       {/* Study Plan Display */}
//       {plan && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-purple-200"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <Target className="text-green-500" size={32} />
//               <h3 className="text-3xl font-black text-gray-800">Your Personalized Study Plan</h3>
//             </div>
//           </div>

//           {/* Plan Stats */}
//           {planData && (
//             <div className="grid grid-cols-3 gap-4 mb-6">
//               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
//                 <div className="flex items-center gap-2 text-blue-700 mb-1">
//                   <Calendar size={18} />
//                   <span className="text-sm font-semibold">Days Left</span>
//                 </div>
//                 <p className="text-3xl font-black text-blue-900">{planData.days_left}</p>
//               </div>

//               <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border-2 border-green-200">
//                 <div className="flex items-center gap-2 text-green-700 mb-1">
//                   <Target size={18} />
//                   <span className="text-sm font-semibold">Documents</span>
//                 </div>
//                 <p className="text-3xl font-black text-green-900">{planData.document_count}</p>
//               </div>

//               <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
//                 <div className="flex items-center gap-2 text-purple-700 mb-1">
//                   <Clock size={18} />
//                   <span className="text-sm font-semibold">Status</span>
//                 </div>
//                 <p className="text-lg font-black text-purple-900">
//                   {planData.days_left > 7 ? '✅ On Track' : '⚡ Urgent'}
//                 </p>
//               </div>
//             </div>
//           )}
          
//           {/* Plan Content */}
//           <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 mb-6 max-h-[500px] overflow-y-auto border-2 border-purple-100">
//             <div className="prose max-w-none">
//               {/* <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-base">
//                 {plan}
//               </pre> */}
//               <StudyTimeline planText={plan} />
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-4">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => generatePlan(true)}
//               disabled={loading}
//               className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               <RefreshCw size={20} />
//               Regenerate Plan
//             </motion.button>
            
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={downloadPlan}
//               className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
//             >
//               <Download size={20} />
//               Download Plan
//             </motion.button>
//           </div>

//           {/* Tips */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3 }}
//             className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
//           >
//             <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
//               <Brain className="text-blue-600" size={20} />
//               Study Tips
//             </h4>
//             <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
//               <li>Stick to the schedule as closely as possible</li>
//               <li>Use the chat feature to clarify any doubts</li>
//               <li>Review flashcards daily for better retention</li>
//               <li>Take short breaks every 25-30 minutes (Pomodoro technique)</li>
//               <li>Adjust the plan if needed - it's okay to be flexible!</li>
//             </ul>
//           </motion.div>
//         </motion.div>
//       )}

//       {/* Empty State Info */}
//       {!plan && !loading && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6"
//         >
//           <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
//             <Brain className="text-purple-600" size={20} />
//             How AI Study Plans Work
//           </h4>
//           <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
//             <li>Analyzes your deadline and available time</li>
//             <li>Reviews all uploaded documents and their content</li>
//             <li>Creates a day-by-day breakdown with specific topics</li>
//             <li>Includes review sessions using spaced repetition</li>
//             <li>Reserves final days for comprehensive review</li>
//             <li>Provides realistic time estimates for each activity</li>
//           </ul>
//         </motion.div>
//       )}
//     </div>
//   );
// }


//////////////////////////////////////////////////

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Calendar, Clock, Brain, Target, Loader, Download, RefreshCw, AlertCircle } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '../api/axios';

// export default function StudyPlan({ workspaceId, workspaceName, deadline }) {
//   const [plan, setPlan] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [daysLeft, setDaysLeft] = useState(0);
//   const [planData, setPlanData] = useState(null);

//   useEffect(() => {
//     if (deadline) {
//       const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
//       setDaysLeft(days);
//     }
//   }, [deadline]);

//   const generatePlan = async (regenerate = false) => {
//     setLoading(true);
//     try {
//       const url = regenerate
//         ? `/workspaces/${workspaceId}/study-plan?regenerate=true`
//         : `/workspaces/${workspaceId}/study-plan`;

//       const response = await api.get(url);
//       setPlan(response.data.plan);
//       setPlanData(response.data);

//       if (response.data.cached) {
//         toast.success('Study plan loaded from cache!');
//       } else {
//         toast.success('New study plan generated!');
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.error || 'Failed to generate plan';
//       toast.error(errorMsg);
//       console.error('Error generating plan:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     generatePlan(false);
//   }, []);

//   // ------------------------------------------------------
//   // TIMELINE UI PARSER
//   // ------------------------------------------------------
// const renderTimeline = () => {
//   if (!plan) return null;

//   const lines = plan.split("\n").filter(l => l.trim() !== "");

//   const blocks = [];
//   let current = null;

//   // Identify different block types
//   const isDay = (l) => l.startsWith("📅");
//   const isFinalReview = (l) =>
//     l.toLowerCase().includes("final review") || l.startsWith("🎯");
//   const isSuccessTips = (l) =>
//     l.toLowerCase().includes("success tips") || l.startsWith("☑️") || l.startsWith("🟩");

//   lines.forEach(line => {
//     if (isDay(line) || isFinalReview(line) || isSuccessTips(line)) {
//       if (current) blocks.push(current);

//       current = {
//         title: line,
//         type: isDay(line) ? "day" : isFinalReview(line) ? "review" : "tips",
//         tasks: []
//       };
//     } else if (current) {
//       current.tasks.push(line);
//     }
//   });

//   if (current) blocks.push(current);

//   return (
//     <div className="space-y-8">

//       {blocks.map((block, idx) => {
//         const total = block.tasks.length;
//         const completed = Math.floor(total * 0.4); // fun fake progress
//         const percent = Math.round((completed / total) * 100);

//         return (
//           <motion.div
//             key={idx}
//             initial={{ opacity: 0, x: 40 }}
//             animate={{ opacity: 1, x: 0 }}
//             className={`rounded-2xl p-6 shadow-xl backdrop-blur border relative overflow-hidden
//               ${block.type === "day" ? "bg-white border-purple-300" : ""}
//               ${block.type === "review" ? "bg-pink-50 border-pink-300" : ""}
//               ${block.type === "tips" ? "bg-green-50 border-green-300" : ""}
//             `}
//           >
//             {/* Floating fun emoji */}
//             <div className="absolute text-6xl opacity-10 right-4 top-4 select-none">
//               {block.type === "day" && "📘"}
//               {block.type === "review" && "🎯"}
//               {block.type === "tips" && "💡"}
//             </div>

//             {/* Title */}
//             <h3 className={`text-2xl font-extrabold mb-4 relative z-10
//               ${block.type === "day" ? "text-purple-700" : ""}
//               ${block.type === "review" ? "text-pink-700" : ""}
//               ${block.type === "tips" ? "text-green-700" : ""}
//             `}>
//               {block.title}
//             </h3>

//             {/* Progress Bar */}
//             {block.type === "day" && (
//               <div className="mb-4">
//                 <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
//                   <span>{completed} done</span>
//                   <span>{percent}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-3">
//                   <div
//                     className="h-3 rounded-full bg-purple-500 transition-all"
//                     style={{ width: `${percent}%` }}
//                   ></div>
//                 </div>
//               </div>
//             )}

//             {/* Tasks */}
//             <ul className="space-y-3 mt-4 relative z-10">
//               {block.tasks.map((task, tIdx) => (
//                 <li
//                   key={tIdx}
//                   className={`p-3 rounded-xl border font-medium shadow-sm backdrop-blur
//                     ${block.type === "day" ? "bg-purple-50 border-purple-200" : ""}
//                     ${block.type === "review" ? "bg-pink-100 border-pink-300" : ""}
//                     ${block.type === "tips" ? "bg-green-100 border-green-300" : ""}
//                   `}
//                 >
//                   {task}
//                 </li>
//               ))}
//             </ul>
//           </motion.div>
//         );
//       })}
//     </div>
//   );
// };


//   const downloadPlan = () => {
//     if (!plan) return;

//     const blob = new Blob([plan], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${workspaceName}-study-plan.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('Plan downloaded! 📥');
//   };

//   return (
//     <div className="space-y-6">
//       {/* Deadline Banner */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className={`rounded-3xl p-8 shadow-2xl text-white ${
//           daysLeft < 7
//             ? 'bg-gradient-to-r from-red-500 to-pink-600'
//             : daysLeft < 14
//             ? 'bg-gradient-to-r from-orange-500 to-red-500'
//             : 'bg-gradient-to-r from-green-500 to-teal-600'
//         }`}
//       >
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-black mb-2">Your Deadline 🎯</h2>
//             <p className="text-xl font-semibold">
//               {deadline
//                 ? new Date(deadline).toLocaleDateString('en-US', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric'
//                   })
//                 : 'Not set'}
//             </p>
//           </div>
//           <div className="text-center bg-white bg-opacity-20 backdrop-blur rounded-2xl p-6 border-2 border-white border-opacity-30">
//             <Calendar size={48} className="mx-auto mb-2" />
//             <p className="text-5xl font-black">{daysLeft}</p>
//             <p className="font-bold text-sm">Days Left</p>
//           </div>
//         </div>

//         {daysLeft < 7 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="mt-4 bg-white bg-opacity-20 backdrop-blur rounded-xl p-4"
//           >
//             <p className="flex items-center gap-2 font-semibold">
//               <AlertCircle size={20} />
//               ⚠️ Less than a week left! Time to focus and prioritize!
//             </p>
//           </motion.div>
//         )}
//       </motion.div>

//       {/* Generate Button */}
//       {!plan && (
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => generatePlan(true)}
//           disabled={loading || !deadline}
//           className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? (
//             <span className="flex items-center justify-center gap-3">
//               <Loader className="animate-spin" size={24} />
//               Crafting your perfect study plan...
//             </span>
//           ) : (
//             <span className="flex items-center justify-center gap-3">
//               <Brain size={24} />
//               Generate AI Study Plan
//             </span>
//           )}
//         </motion.button>
//       )}

//       {/* Study Plan Display */}
//       {plan && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-purple-200"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <Target className="text-green-500" size={32} />
//               <h3 className="text-3xl font-black text-gray-800">Your Personalized Study Plan</h3>
//             </div>
//           </div>

//           {/* Plan Stats */}
//           {planData && (
//             <div className="grid grid-cols-3 gap-4 mb-6">
//               <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//                 <div className="flex items-center gap-2 text-blue-700 mb-1">
//                   <Calendar size={18} />
//                   <span className="text-sm font-semibold">Days Left</span>
//                 </div>
//                 <p className="text-3xl font-black text-blue-900">{planData.days_left}</p>
//               </div>

//               <div className="bg-green-50 rounded-xl p-4 border border-green-200">
//                 <div className="flex items-center gap-2 text-green-700 mb-1">
//                   <Target size={18} />
//                   <span className="text-sm font-semibold">Documents</span>
//                 </div>
//                 <p className="text-3xl font-black text-green-900">{planData.document_count}</p>
//               </div>

//               <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
//                 <div className="flex items-center gap-2 text-pink-700 mb-1">
//                   <Clock size={18} />
//                   <span className="text-sm font-semibold">Status</span>
//                 </div>
//                 <p className="text-lg font-black text-pink-900">
//                   {planData.days_left > 7 ? '✅ On Track' : '⚡ Urgent'}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* TIMELINE BOX */}
//           <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 mb-6 max-h-[500px] overflow-y-auto border-2 border-purple-200">
//             {renderTimeline()}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-4">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => generatePlan(true)}
//               disabled={loading}
//               className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               <RefreshCw size={20} />
//               Regenerate Plan
//             </motion.button>

//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={downloadPlan}
//               className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
//             >
//               <Download size={20} />
//               Download Plan
//             </motion.button>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Brain, Target, Loader, Download, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function StudyPlan({ workspaceId, workspaceName, deadline }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    if (deadline) {
      const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
      setDaysLeft(days);
    }
  }, [deadline]);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/study-plan`);
      setPlan(response.data.plan);
      setPlanData(response.data);
      toast.success('Study plan generated! 📚');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to generate plan';
      toast.error(errorMsg);
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = () => {
    if (!plan) return;
    
    const blob = new Blob([plan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspaceName}-study-plan.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Plan downloaded! 📥');
  };

  return (
    <div className="space-y-6">
      {/* Deadline Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 text-white ${
          daysLeft < 7 
            ? 'bg-gradient-to-r from-rose-500 to-pink-500' 
            : daysLeft < 14
            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Deadline</h2>
            <p className="text-lg font-semibold opacity-90">
              {deadline ? new Date(deadline).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Not set'}
            </p>
          </div>
          <div className="text-center bg-white/20 backdrop-blur rounded-xl p-6 border border-white/30">
            <Calendar size={32} className="mx-auto mb-2" />
            <p className="text-4xl font-bold">{daysLeft}</p>
            <p className="font-semibold text-sm">Days Left</p>
          </div>
        </div>

        {daysLeft < 7 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-white/20 backdrop-blur rounded-lg p-3"
          >
            <p className="flex items-center gap-2 font-semibold text-sm">
              <AlertCircle size={18} />
              ⚠️ Less than a week left! Time to focus and prioritize!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Generate Button */}
      {!plan && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={generatePlan}
          disabled={loading || !deadline}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={24} />
              Crafting your perfect study plan...
            </>
          ) : (
            <>
              <Brain size={24} />
              Generate AI Study Plan
            </>
          )}
        </motion.button>
      )}

      {/* Study Plan Display */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="text-emerald-500" size={28} />
              <h3 className="text-2xl font-bold text-slate-800">Your Personalized Study Plan</h3>
            </div>
          </div>

          {/* Plan Stats */}
          {planData && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Calendar size={16} />
                  <span className="text-xs font-semibold">Days Left</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{planData.days_left}</p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Target size={16} />
                  <span className="text-xs font-semibold">Documents</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{planData.document_count}</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <Clock size={16} />
                  <span className="text-xs font-semibold">Status</span>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {planData.days_left > 7 ? '✅ On Track' : '⚡ Urgent'}
                </p>
              </div>
            </div>
          )}
          
          {/* Plan Content */}
          <div className="bg-slate-50 rounded-xl p-6 mb-6 max-h-[500px] overflow-y-auto border border-slate-200">
            <pre className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans text-sm">
              {plan}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={generatePlan}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Regenerate Plan
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={downloadPlan}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Plan
            </motion.button>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Brain className="text-blue-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Study Tips</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Stick to the schedule as closely as possible</li>
                  <li>• Use the chat feature to clarify doubts</li>
                  <li>• Review flashcards daily for retention</li>
                  <li>• Take breaks every 25-30 minutes (Pomodoro)</li>
                  <li>• Adjust the plan if needed - flexibility is okay!</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Empty State Info */}
      {!plan && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Brain className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1 text-sm">How AI Study Plans Work</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Analyzes your deadline and available time</li>
                <li>• Reviews all uploaded documents and content</li>
                <li>• Creates day-by-day breakdown with specific topics</li>
                <li>• Includes review sessions using spaced repetition</li>
                <li>• Reserves final days for comprehensive review</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}