import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";
import { Search } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  level: string;
  achievement: string;
  year: string;
}

interface Event {
  id: string;
  name: string;
  type: string;
  role: string;
  year: string;
}

const dummySports: Sport[] = [
  {
    id: "1",
    name: "Basketball",
    level: "District",
    achievement: "Runner",
    year: "2023",
  },
  {
    id: "2",
    name: "Athletics",
    level: "College",
    achievement: "Winner - 100m Sprint",
    year: "2024",
  },
  {
    id: "3",
    name: "Table Tennis",
    level: "State",
    achievement: "Participant",
    year: "2023",
  },
  {
    id: "4",
    name: "Volleyball",
    level: "College",
    achievement: "Winner",
    year: "2024",
  },
];

const dummyEvents: Event[] = [
  {
    id: "1",
    name: "Smart India Hackathon 2024",
    type: "Hackathon",
    role: "Participant",
    year: "2024",
  },
  {
    id: "2",
    name: "Tech Symposium",
    type: "Technical",
    role: "Organizer",
    year: "2023",
  },
  {
    id: "3",
    name: "AI Workshop",
    type: "Seminar",
    role: "Participant",
    year: "2024",
  },
  {
    id: "4",
    name: "Cultural Fest 2024",
    type: "Cultural",
    role: "Volunteer",
    year: "2024",
  },
  {
    id: "5",
    name: "Code Debugging Championship",
    type: "Technical",
    role: "Participant",
    year: "2023",
  },
];

export function ExtraCurricularView() {
  const [sportsSearch, setSportsSearch] = useState("");
  const [eventsSearch, setEventsSearch] = useState("");

  const filteredSports = useMemo(() => {
    return dummySports.filter(
      (sport) =>
        sport.name.toLowerCase().includes(sportsSearch.toLowerCase()) ||
        sport.level.toLowerCase().includes(sportsSearch.toLowerCase())
    );
  }, [sportsSearch]);

  const filteredEvents = useMemo(() => {
    return dummyEvents.filter(
      (event) =>
        event.name.toLowerCase().includes(eventsSearch.toLowerCase()) ||
        event.type.toLowerCase().includes(eventsSearch.toLowerCase())
    );
  }, [eventsSearch]);

  const getAchievementColor = (achievement: string) => {
    if (achievement.includes("Winner")) return "bg-yellow-100 text-yellow-800";
    if (achievement.includes("Runner")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Hackathon":
        return "bg-purple-100 text-purple-800";
      case "Technical":
        return "bg-blue-100 text-blue-800";
      case "Cultural":
        return "bg-pink-100 text-pink-800";
      case "Seminar":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sports" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* Sports Tab */}
        <TabsContent value="sports" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sports..."
              value={sportsSearch}
              onChange={(e) => setSportsSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01898d] focus:border-transparent transition-all"
            />
          </motion.div>

          {filteredSports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <p>No sports found</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSports.map((sport, idx) => (
                <motion.div
                  key={sport.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">{sport.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Level:</span>
                      <span className="text-sm font-medium text-gray-900">{sport.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Achievement:</span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getAchievementColor(
                          sport.achievement
                        )}`}
                      >
                        {sport.achievement}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Year:</span>
                      <span className="text-sm font-medium text-gray-900">{sport.year}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={eventsSearch}
              onChange={(e) => setEventsSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01898d] focus:border-transparent transition-all"
            />
          </motion.div>

          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <p>No events found</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">{event.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getEventTypeColor(
                          event.type
                        )}`}
                      >
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Role:</span>
                      <span className="text-sm font-medium text-gray-900">{event.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Year:</span>
                      <span className="text-sm font-medium text-gray-900">{event.year}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}




