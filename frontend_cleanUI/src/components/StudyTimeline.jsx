import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, Target } from "lucide-react";

export default function StudyTimeline({ planText }) {
  if (!planText) return null;

  // Split the plan into sections
  const sections = planText.split("\n");

  // Extract day blocks (everything starting with 📅)
  const dayBlocks = [];
  let currentDay = null;

  for (let line of sections) {
    if (line.startsWith("📅")) {
      if (currentDay) dayBlocks.push(currentDay);
      currentDay = { title: line.trim(), tasks: [] };
    } else if (currentDay && line.trim().startsWith("-")) {
      currentDay.tasks.push(line.trim());
    }
  }
  if (currentDay) dayBlocks.push(currentDay);

  // Extract Final Review + Success Tips
  const finalReviewIndex = sections.findIndex((l) =>
    l.startsWith("🎯 **Final Review")
  );

  const tipsIndex = sections.findIndex((l) =>
    l.startsWith("✅ **Success Tips")
  );

  const finalReview = finalReviewIndex !== -1
    ? sections.slice(finalReviewIndex + 1, tipsIndex).join("\n")
    : null;

  const successTips = tipsIndex !== -1
    ? sections.slice(tipsIndex + 1).join("\n")
    : null;

  return (
    <div className="relative pl-8 mt-10">
      {/* Timeline vertical line */}
      <div className="absolute left-3 top-0 w-1 bg-purple-300 rounded-full h-full"></div>

      {/* === Day-by-day timeline === */}
      {dayBlocks.map((day, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative mb-10"
        >
          {/* Dot */}
          <div className="absolute -left-5 top-2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow"></div>

          <div className="bg-white shadow-xl rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={22} className="text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">{day.title}</h3>
            </div>

            <div className="space-y-2 ml-2">
              {day.tasks.map((task, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-2 text-gray-700"
                >
                  <Clock size={16} className="text-purple-500 mt-1" />
                  {task}
                </motion.p>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* === Final Review Section === */}
      {finalReview && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 border-yellow-300 rounded-2xl p-6 border mt-10 shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target size={22} className="text-yellow-700" />
            <h3 className="text-xl font-bold text-yellow-800">
              Final Review Days 🎯
            </h3>
          </div>
          <pre className="whitespace-pre-wrap text-yellow-900 text-sm">
            {finalReview}
          </pre>
        </motion.div>
      )}

      {/* === Success Tips === */}
      {successTips && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 border-green-300 rounded-2xl p-6 border mt-6 shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={22} className="text-green-700" />
            <h3 className="text-xl font-bold text-green-800">
              Success Tips ✅
            </h3>
          </div>
          <pre className="whitespace-pre-wrap text-green-900 text-sm">
            {successTips}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
