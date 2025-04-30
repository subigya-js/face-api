import FaceUploader from '../components/FaceUploader';
import FaceRecognizer from '../components/FaceRecognizer';

export default function AttendancePage() {
  return (
    <main className="p-10 space-y-10">
      <h1 className="text-2xl font-bold">Face Attendance System</h1>
      <FaceUploader />
      <FaceRecognizer />
    </main>
  );
}
