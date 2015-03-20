class GoogleService

	def initialize client, api
		$client = client
		$api = api
	end

	def load_drive_media file_path, content_type
		media = Google::APIClient::UploadIO.new(file_path, content_type)
		return media
	end

	def execute_cloud_insert media, file
		response = $client.execute(
	    	:api_method => $api.files.insert,
	    	:body_object => file,
	    	:media => media,
	    	:parameters => {
	      		'uploadType' => 'multipart',
	      		'alt' => 'json' })
		return response
	end

	def insert_new_files_permission monea_user, file_id

		new_permission = $api.permissions.insert.request_schema.new({
						    'value' => monea_user.email,
						    'type' => "user",
						    'role' => "reader"
						})

		result = $client.execute(:api_method => $api.permissions.insert,
											    :body_object => new_permission,
											    :parameters => { 'fileId' => file_id, 'emailMessage' => 'Shared via monea.build' })

		return result
	end

end