import { usePatientRecords } from '@/hooks/usePatientRecords';

export default function SimplePatientRecordViewer() {
  const { records, loading, error } = usePatientRecords();

  return (
    <div className="space-y-4 border rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold">My Shared Medical Records</h2>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}

      {!loading && !error && records.length === 0 && (
        <p className="text-sm text-muted-foreground">No shared records available.</p>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Created</th>
                <th className="px-4 py-2 border">ID</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 border">
                    {r.record_type?.replace('_', ' ') || 'Medical Record'}
                  </td>
                  <td className="px-4 py-2 border">
                    <span className="text-green-600">
                      {r.record_hash ? 'Secured' : 'Processing'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border">
                    {r.id.slice(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}