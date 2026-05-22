import { Modal } from '@core-client/components/Modal';

type Props = {
  message: string;
  onClose: () => void;
};

export default function SystemErrorScreen({ message, onClose }: Props) {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6 min-w-[320px]">
        <div>
          <h2 className="text-xl font-bold text-red-500">System Error</h2>

          <p className="mt-2 text-sm text-gray-300">
            ゲームシステムにエラーが発生しました。
          </p>
        </div>

        {message && (
          <div className="rounded bg-neutral-800 p-3 text-sm text-gray-200 break-words">
            {message}
          </div>
        )}
      </div>
    </Modal>
  );
}
