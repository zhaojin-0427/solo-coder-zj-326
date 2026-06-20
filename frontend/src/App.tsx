import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Collection from '@/pages/Collection';
import Pronunciation from '@/pages/Pronunciation';
import Annotation from '@/pages/Annotation';
import Stories from '@/pages/Stories';
import StoryDetail from '@/pages/StoryDetail';
import Collaboration from '@/pages/Collaboration';
import Statistics from '@/pages/Statistics';
import DialectMap from '@/pages/DialectMap';
import HeritageTask from '@/pages/HeritageTask';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/collection" replace />} />
          <Route path="collection" element={<Collection />} />
          <Route path="pronunciation" element={<Pronunciation />} />
          <Route path="annotation" element={<Annotation />} />
          <Route path="stories" element={<Stories />} />
          <Route path="stories/:id" element={<StoryDetail />} />
          <Route path="collaboration" element={<Collaboration />} />
          <Route path="dialect-map" element={<DialectMap />} />
          <Route path="heritage-tasks" element={<HeritageTask />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
