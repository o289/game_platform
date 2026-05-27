import { Modal } from '@core-client/components/Modal';

type Props = {
  title: string;
  message: string;
  onClose: () => void;
};

export default function SystemErrorScreen({ title, message, onClose }: Props) {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6 min-w-[320px]">
        <h2 className="text-xl font-bold text-red-500">{title}</h2>

        {message && (
          <div className="rounded bg-neutral-800 p-3 text-sm text-gray-200 break-words">
            {message}
          </div>
        )}
      </div>
    </Modal>
  );
}
