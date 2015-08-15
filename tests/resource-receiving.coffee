###
resources as an array
resources as a json feed
resources as a function
resourceParentField
resourcesSet (callback)
###

describe 'event resources', ->

	stackCalendarOptions
		defaultView: 'timelineDay'

	it 'processes multiple resources', (done) ->
		initCalendar
			resources: [
				{ id: 1, title: 'room 1' }
				{ id: 2, title: 'room 2' }
			]
			resourcesSet: (resources) ->
				expect(resources.length).toBe(2)
				expect(resources[0].id).toBe('1')
				expect(resources[1].id).toBe('2')
				expect(resources[0].title).toBe('room 1')
				expect(resources[1].title).toBe('room 2')
				done()

	it 'will not process colliding IDs', (done) ->
		initCalendar
			resources: [
				{ id: 1, title: 'room 1' }
				{ id: 2, title: 'room 2' }
				{ id: 2, title: 'room 2' }
			]
			resourcesSet: (resources) ->
				# TODO: expect a console warning
				expect(resources.length).toBe(2)
				expect(resources[0].id).toBe('1')
				expect(resources[1].id).toBe('2')
				expect(resources[0].title).toBe('room 1')
				expect(resources[1].title).toBe('room 2')
				done()

	it 'will process resources without IDs', (done) ->
		initCalendar
			resources: [
				{ title: 'room 1' }
				{ title: 'room 2' }
			]
			resourcesSet: (resources) ->
				expect(resources.length).toBe(2)
				expect(resources[0].title).toBe('room 1')
				expect(resources[1].title).toBe('room 2')
				done()

	it 'will allow nested children', (done) ->
		initCalendar
			resources: [
				{ id: 'a', title: 'room a', children: [
					{ id: 'a1', title: 'room a1' }
				] }
			]
			resourcesSet: (resources) ->
				expect(resources.length).toBe(1)
				expect(resources[0].children.length).toBe(1)
				expect(resources[0].title).toBe('room a')
				expect(resources[0].children[0].title).toBe('room a1')
				done()

	it 'will allow flat children', (done) ->
		initCalendar
			resources: [
				{ id: 'a', title: 'room a' }
				{ id: 'a1', title: 'room a1', parentId: 'a' }
			]
			resourcesSet: (resources) ->
				expect(resources.length).toBe(1)
				expect(resources[0].children.length).toBe(1)
				expect(resources[0].title).toBe('room a')
				expect(resources[0].children[0].title).toBe('room a1')
				done()

	it 'will allow flat children with a custom resourceParentId', (done) ->
		initCalendar
			resourceParentField: 'superRoomId',
			resources: [
				{ id: 'a', title: 'room a' }
				{ id: 'a1', title: 'room a1', superRoomId: 'a' }
			]
			resourcesSet: (resources) ->
				expect(resources.length).toBe(1)
				expect(resources[0].children.length).toBe(1)
				expect(resources[0].title).toBe('room a')
				expect(resources[0].children[0].title).toBe('room a1')
				done()

	it 'will read resources from a json feed', (done) ->
		initCalendar
			resources: '/base/tests/json/two-rooms.json'
			resourcesSet: (resources) ->
				expect(resources.length).toBe(2)
				expect(resources[0].id).toBe('1')
				expect(resources[1].id).toBe('2')
				expect(resources[0].title).toBe('room 1')
				expect(resources[1].title).toBe('room 2')
				done()

	it 'will read resources from a function', (done) ->
		initCalendar
			resources: (callback) ->
				callback([
					{ id: 1, title: 'room 1' }
					{ id: 2, title: 'room 2' }
				])
			resourcesSet: (resources) ->
				expect(resources.length).toBe(2)
				expect(resources[0].id).toBe('1')
				expect(resources[1].id).toBe('2')
				expect(resources[0].title).toBe('room 1')
				expect(resources[1].title).toBe('room 2')
				done()
