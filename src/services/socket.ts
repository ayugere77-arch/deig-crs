import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

let socket: Socket | null = null;

export const socketService = {
  connect() {
    if (socket) return;
    
    socket = io(window.location.origin);

    socket.on('connect', () => {
      console.log('Telemetry Link Established');
    });

    socket.on('new_report', (report) => {
      toast.info(`New Urgent Report: ${report.id}`, {
        description: 'Priority ledger updated in real-time.',
        action: {
          label: 'View',
          onClick: () => window.location.href = `/admin`
        }
      });
    });

    socket.on('status_updated', (data) => {
      toast.success(`Case ${data.id} Status Updated`, {
        description: `New Phase: ${data.status}`
      });
    });

    socket.on('disconnect', () => {
      console.log('Telemetry Link Offline');
    });
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket() {
    return socket;
  }
};
