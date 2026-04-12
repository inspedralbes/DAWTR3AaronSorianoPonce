<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SeientActualitzat implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $eventId;
    public $update;

    public function __construct($eventId, $seient)
    {
        $this->eventId = $eventId;
        $this->update = [
            'id' => $seient->id,
            'estat' => $seient->estat,
            'socketId' => $seient->socket_id,
            'expiresAt' => $seient->expires_at
        ];
    }

    public function broadcastOn()
    {
        return new Channel('event.' . $this->eventId);
    }

    public function broadcastAs()
    {
        return 'seient.actualitzat';
    }
}
