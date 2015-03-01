class PeoplesController < ApplicationController

	before_action :discover_api

	def index
    	# Get the list of people.
	    @response = $client.execute!(@plus.people.list,
	                                :collection => 'visible',
	                                :userId => 'me')
	    respond_to do |format|
	      	format.html
	      	format.js { @peoples = @response.data }
	    end
	    # render json: JSON.parse(@response).to_json
	end

	def show
	    # Get a person's profile.
	    response = $client.execute!(@plus.people.get,
	                                :userId => params[:id]).body

	    render json: JSON.parse(response).to_json
	end

	def add_friend_to_team
		team = Circle.find(params[:circle_id])
		person_g_id = params[:person_google_id]
		user = User.find_by(google_id: person_g_id)
		teamfiles = team.team_files
		team_member = TeamMember.find_by(circle_id: team.id, google_id: person_g_id) 
		files_shared = false
		if team_member.present?
			team_member
		else
			team_member = TeamMember.create(circle_id: team.id, google_id: person_g_id)
            if teamfiles.present?
				drive = $client.discovered_api('drive', 'v2')
              	teamfiles.each do |teamfile|
              		files_shared = true
	                new_permission = drive.permissions.insert.request_schema.new({
	                  	'value' => user.email,
	                  	'type' => "user",
	                  	'role' => "reader"
	                })

                	result = $client.execute(:api_method => drive.permissions.insert,
                        :body_object => new_permission,
                		:parameters => { 'fileId' => teamfile.file_id, 'emailMessage' => "Shared via monea.build within moneaTeam '#{team.display_name}' " })
              		
              	end
            end
        end
	    respond_to do |format|
	      	format.html
	      	format.js { @team_member = team_member }
	    end
	end

	def monea_email_search
		# Search all public profiles.
		response = User.find(:all, :conditions => ["email LIKE ?", "#{params[:query]}%"])

	    render json: response
	end

	def search
		# Search all public profiles.
		if params[:next_page_token].present?
		    response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query],
		                                'maxResults' => 20,
		                                'pageToken' => params[:next_page_token]}).body
		else
			response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query],
		                                'maxResults' => 20}).body
		end
	    render json: response.to_json
	end

	def list_by_activity
		# List all of the people in the specified collection for a particular activity.
		response = $client.execute!(@plus.people.list_by_activity,
								  {'activityId' => params[:activity_id],
								   'collection' => params[:collection]}).body
		
	    render json: JSON.parse(response).to_json
	end

	def circle_peoples
		@team_members = Circle.find(params[:id]).team_members
		render json: @team_members
	end

	def add_people
	    case 
	    when !params[:user_id]
			if params[:google_id].present?
				params[:google_id].each do |google_id|
					unless TeamMember.find_by(circle_id: params[:circle_id], google_id: google_id).present?
						team_member = TeamMember.create(circle_id: params[:circle_id], google_id: google_id)
						user = User.find_by(google_id: google_id)
						if user
							drive = $client.discovered_api('drive', 'v2')
							teamfiles = team_member.circle.team_files
				            if teamfiles
				              	teamfiles.each do |teamfile|
					                new_permission = drive.permissions.insert.request_schema.new({
					                  	'value' => user.email,
					                  	'type' => "user",
					                  	'role' => "reader"
					                })

				                	result = $client.execute(:api_method => drive.permissions.insert,
				                        :body_object => new_permission,
				                		:parameters => { 'fileId' => teamfile.file_id, 'emailMessage' => 'Shared via monea.build' })
				              	end
				            end
				        end
					end
				end
			end
		else
		  user = User.find_by(id: params[:user_id])
		  team_member = TeamMember.create(circle_id: params[:circle_id], google_id: user.google_id)
		  if user
			  	drive = $client.discovered_api('drive', 'v2')
			  	teamfiles = team_member.circle.team_files
			  	if teamfiles
	              	teamfiles.each do |teamfile|
		                new_permission = drive.permissions.insert.request_schema.new({
		                  	'value' => user.email,
		                  	'type' => "user",
		                  	'role' => "reader"
		                })

	                	result = $client.execute(:api_method => drive.permissions.insert,
	                        :body_object => new_permission,
	                        :parameters => { 'fileId' => teamfile.file_id, 'emailMessage' => 'Shared via monea.build' })
	              	end
	            end
			  end
		end
		redirect_to circle_path(params[:circle_id])
	end

	def remove_team_member
		@member = TeamMember.find_by(circle_id: params[:circle_id], google_id: google_id)
		if @member.destroy
			@message = "Success".to_json
			render json: @message
		else
			@message = "Failure".to_json
			render json: @message
		end
	end	

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@plus = $client.discovered_api('plus', 'v1')
	end
end
