class ToasterInstanceManager {
	private activeInstanceId: string | null = null;
	private instanceCounter = 0;

	registerInstance(): string {
		const instanceId = `toaster-${++this.instanceCounter}`;
		if (!this.activeInstanceId) {
			this.activeInstanceId = instanceId;
		}
		return instanceId;
	}

	unregisterInstance(instanceId: string): void {
		if (this.activeInstanceId === instanceId) {
			this.activeInstanceId = null;
		}
	}

	isActiveInstance(instanceId: string): boolean {
		return this.activeInstanceId === instanceId;
	}
}

export const toasterInstanceManager = new ToasterInstanceManager();
export { ToasterInstanceManager };
