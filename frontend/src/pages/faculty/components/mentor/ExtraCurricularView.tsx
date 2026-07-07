import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ExtraCurricularViewProps {
  student: any;
  onSave: (section: string, data: any) => void;
  isMentorMode?: boolean;
}

export function ExtraCurricularView({ student, onSave, isMentorMode }: ExtraCurricularViewProps) {
  const [sportsSearch, setSportsSearch] = useState("");
  const [eventsSearch, setEventsSearch] = useState("");
  
  const [isAddingSport, setIsAddingSport] = useState(false);
  const [newSport, setNewSport] = useState({ name: "", level: "", achievement: "", year: "" });
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", type: "", role: "", year: "" });

  const sports: Sport[] = student?.extraCurricular?.sports || [];
  const events: Event[] = student?.extraCurricular?.events || [];

  const filteredSports = useMemo(() => {
    return sports.filter(
      (sport) =>
        sport.name.toLowerCase().includes(sportsSearch.toLowerCase()) ||
        sport.level.toLowerCase().includes(sportsSearch.toLowerCase())
    );
  }, [sportsSearch, sports]);

  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(eventsSearch.toLowerCase()) ||
        event.type.toLowerCase().includes(eventsSearch.toLowerCase())
    );
  }, [eventsSearch, events]);

  const handleAddSport = () => {
    if (!newSport.name) return;
    const sport: Sport = { id: Date.now().toString(), ...newSport };
    const updatedSports = [...sports, sport];
    onSave("ExtraCurricular", { extraCurricular: { sports: updatedSports, events } });
    setIsAddingSport(false);
    setNewSport({ name: "", level: "", achievement: "", year: "" });
  };

  const handleAddEvent = () => {
    if (!newEvent.name) return;
    const event: Event = { id: Date.now().toString(), ...newEvent };
    const updatedEvents = [...events, event];
    onSave("ExtraCurricular", { extraCurricular: { sports, events: updatedEvents } });
    setIsAddingEvent(false);
    setNewEvent({ name: "", type: "", role: "", year: "" });
  };

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Extra Curricular Activities</h2>
      </div>
      <Tabs defaultValue="sports" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* Sports Tab */}
        <TabsContent value="sports" className="space-y-4">
          <div className="flex justify-end mb-4">
            {isMentorMode && !isAddingSport && (
              <Button onClick={() => setIsAddingSport(true)} variant="outline">
                <Plus size={16} className="mr-2" /> Add Sport
              </Button>
            )}
          </div>
          
          {isAddingSport && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 mb-4">
              <h3 className="font-semibold text-gray-900">Add New Sport</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Sport Name" value={newSport.name} onChange={(e) => setNewSport({ ...newSport, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Level (e.g. District)" value={newSport.level} onChange={(e) => setNewSport({ ...newSport, level: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Achievement" value={newSport.achievement} onChange={(e) => setNewSport({ ...newSport, achievement: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Year" value={newSport.year} onChange={(e) => setNewSport({ ...newSport, year: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAddingSport(false)}>Cancel</Button>
                <Button onClick={handleAddSport}>Save Sport</Button>
              </div>
            </div>
          )}

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
          <div className="flex justify-end mb-4">
            {isMentorMode && !isAddingEvent && (
              <Button onClick={() => setIsAddingEvent(true)} variant="outline">
                <Plus size={16} className="mr-2" /> Add Event
              </Button>
            )}
          </div>

          {isAddingEvent && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 mb-4">
              <h3 className="font-semibold text-gray-900">Add New Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Event Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Type (e.g. Technical)" value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Role" value={newEvent.role} onChange={(e) => setNewEvent({ ...newEvent, role: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Year" value={newEvent.year} onChange={(e) => setNewEvent({ ...newEvent, year: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
                <Button onClick={handleAddEvent}>Save Event</Button>
              </div>
            </div>
          )}

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




